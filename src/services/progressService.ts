import { SUBJECTS } from '@/config/subjects'
import { STREAK_BONUSES, XP_REWARDS } from '@/config/xp'
import type {
  Activity,
  ActivityType,
  Challenge,
  ChallengeAttempt,
  EngineeringDecision,
  QuizAttempt,
  RealWorldProblem,
  SubjectSlug,
  UserProfile,
} from '@/models'
import type { Repositories } from '@/repositories'
import { todayIso } from '@/utils/date'

import { evaluateNewlyUnlockedAchievements } from './achievementService'
import { computeNextReview, createInitialReviewState } from './spacedRepetitionService'
import { computeSubjectProgress } from './skillService'
import { computeStreakAfterActivity } from './streakService'

function newId(): string {
  return crypto.randomUUID()
}

async function todaysXpTotal(repos: Repositories, today: string): Promise<number> {
  const activities = await repos.activities.list()
  return activities
    .filter((activity) => activity.date === today)
    .reduce((sum, activity) => sum + activity.xpEarned, 0)
}

interface AwardParams {
  type: ActivityType
  xpEarned: number
  label: string
  subjectId?: SubjectSlug
  refId?: string
  profilePatch?: Partial<UserProfile>
  quizWasPerfect?: boolean
}

/**
 * Central write path for anything that earns XP or logs activity. Every user-facing "complete
 * X" action in the app funnels through here so streaks, totals, and achievement checks stay
 * consistent in one place instead of being recomputed ad hoc per feature.
 */
async function awardAndLog(
  uid: string,
  repos: Repositories,
  params: AwardParams,
): Promise<{ profile: UserProfile; activity: Activity; newlyUnlockedAchievementIds: string[] }> {
  const today = todayIso()
  const timestamp = new Date().toISOString()

  const activity: Activity = {
    id: newId(),
    userId: uid,
    type: params.type,
    date: today,
    timestamp,
    xpEarned: params.xpEarned,
    label: params.label,
    ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
    ...(params.refId !== undefined ? { refId: params.refId } : {}),
  }
  await repos.activities.upsert(activity)

  const current = await repos.userProfile.get()
  if (!current) {
    throw new Error('User profile not found. It should be seeded on first launch.')
  }

  const todayTotal = await todaysXpTotal(repos, today)
  const streak = computeStreakAfterActivity(
    {
      currentStreakDays: current.currentStreakDays,
      longestStreakDays: current.longestStreakDays,
      lastActiveDate: current.lastActiveDate,
    },
    today,
    todayTotal,
  )

  let bonusXp = 0
  if (streak.currentStreakDays !== current.currentStreakDays) {
    const bonus = STREAK_BONUSES.find((entry) => entry.days === streak.currentStreakDays)
    if (bonus) bonusXp = bonus.xp
  }

  const updatedProfile: UserProfile = {
    ...current,
    ...params.profilePatch,
    totalXp: current.totalXp + params.xpEarned + bonusXp,
    currentStreakDays: streak.currentStreakDays,
    longestStreakDays: streak.longestStreakDays,
    lastActiveDate: streak.lastActiveDate,
  }
  await repos.userProfile.update(updatedProfile)

  if (bonusXp > 0) {
    await repos.activities.upsert({
      id: newId(),
      userId: uid,
      type: 'streak-bonus',
      date: today,
      timestamp: new Date().toISOString(),
      xpEarned: bonusXp,
      label: `${streak.currentStreakDays}-day streak bonus`,
    })
  }

  const [allActivities, allQuizAttempts, existingAchievements] = await Promise.all([
    repos.activities.list(),
    repos.quizAttempts.list(),
    repos.userAchievements.list(),
  ])
  const completedLessonIds = new Set(
    allActivities.filter((a) => a.type === 'lesson-completed' && a.refId).map((a) => a.refId!),
  )
  const masteryBySubject = new Map(
    SUBJECTS.map((subject) => [
      subject.id,
      computeSubjectProgress(subject.id, completedLessonIds, allQuizAttempts).masteryPercent,
    ]),
  )
  const newlyUnlockedAchievementIds = evaluateNewlyUnlockedAchievements({
    profile: updatedProfile,
    lastQuizPerfect: Boolean(params.quizWasPerfect),
    masteryBySubject,
    alreadyUnlockedIds: new Set(existingAchievements.map((entry) => entry.achievementId)),
  })

  for (const achievementId of newlyUnlockedAchievementIds) {
    await repos.userAchievements.upsert({
      id: achievementId,
      achievementId,
      userId: uid,
      unlockedAt: timestamp,
    })
  }

  return { profile: updatedProfile, activity, newlyUnlockedAchievementIds }
}

// Same check-then-act race as ensureSeeded (see seedService.ts) — guard against concurrent calls
// (React StrictMode's double effect invoke, or any other accidental double call) recording two
// "opened app" activities before either write lands.
const inFlightAppOpens = new Map<string, Promise<void>>()

export async function recordAppOpen(uid: string, repos: Repositories): Promise<void> {
  const existing = inFlightAppOpens.get(uid)
  if (existing) return existing

  const run = (async () => {
    const today = todayIso()
    const activities = await repos.activities.list()
    const alreadyOpenedToday = activities.some(
      (activity) => activity.type === 'app-opened' && activity.date === today,
    )
    if (alreadyOpenedToday) return
    await awardAndLog(uid, repos, {
      type: 'app-opened',
      xpEarned: XP_REWARDS.appOpenedToday,
      label: 'Opened MobileMastery',
    })
  })().finally(() => inFlightAppOpens.delete(uid))

  inFlightAppOpens.set(uid, run)
  return run
}

export async function completeLesson(
  uid: string,
  repos: Repositories,
  lessonId: string,
  lessonTitle: string,
  subjectId: SubjectSlug,
) {
  const current = await repos.userProfile.get()
  return awardAndLog(uid, repos, {
    type: 'lesson-completed',
    xpEarned: XP_REWARDS.lessonCompleted,
    label: `Completed lesson: ${lessonTitle}`,
    subjectId,
    refId: lessonId,
    profilePatch: { lessonsCompleted: (current?.lessonsCompleted ?? 0) + 1 },
  })
}

export async function submitQuizAttempt(
  uid: string,
  repos: Repositories,
  attempt: QuizAttempt,
  quizTitle: string,
  subjectId: SubjectSlug,
) {
  await repos.quizAttempts.upsert(attempt)

  // Feed each question's topic into the spaced-repetition schedule (spec section 13).
  const today = todayIso()
  for (const result of attempt.results) {
    const entryId = `${subjectId}:${result.topic}`
    const existing = await repos.reviewSchedule.get(entryId)
    const nextState = computeNextReview(
      existing ?? createInitialReviewState(),
      result.correct,
      today,
    )
    await repos.reviewSchedule.upsert({
      id: entryId,
      userId: uid,
      topic: result.topic,
      subjectId,
      lessonId: attempt.quizId,
      ...nextState,
    })
  }

  const current = await repos.userProfile.get()
  const xpEarned = XP_REWARDS.quizCompleted + (attempt.perfect ? XP_REWARDS.quizPerfectBonus : 0)
  const previousCount = current?.quizzesCompleted ?? 0
  const previousAverage = current?.averageQuizScorePercent ?? 0
  const newAverage = Math.round(
    (previousAverage * previousCount + attempt.scorePercent) / (previousCount + 1),
  )
  return awardAndLog(uid, repos, {
    type: 'quiz-completed',
    xpEarned,
    label: `${attempt.perfect ? 'Perfect score' : 'Completed'} quiz: ${quizTitle}`,
    subjectId,
    refId: attempt.quizId,
    profilePatch: {
      quizzesCompleted: previousCount + 1,
      averageQuizScorePercent: newAverage,
    },
    quizWasPerfect: attempt.perfect,
  })
}

export async function completeChallenge(
  uid: string,
  repos: Repositories,
  attempt: ChallengeAttempt,
  challenge: Challenge,
) {
  await repos.challengeAttempts.upsert(attempt)
  const current = await repos.userProfile.get()
  return awardAndLog(uid, repos, {
    type: 'challenge-completed',
    xpEarned: challenge.xpReward,
    label: `Completed challenge: ${challenge.title}`,
    subjectId: challenge.subjectId,
    refId: challenge.id,
    profilePatch: {
      challengesCompleted: (current?.challengesCompleted ?? 0) + 1,
      performanceChallengesCompleted:
        (current?.performanceChallengesCompleted ?? 0) +
        (challenge.type === 'performance-problem' ? 1 : 0),
    },
  })
}

export async function logRealWorldProblem(
  uid: string,
  repos: Repositories,
  problem: RealWorldProblem,
) {
  await repos.realWorldProblems.upsert(problem)
  const current = await repos.userProfile.get()
  return awardAndLog(uid, repos, {
    type: 'problem-logged',
    xpEarned: XP_REWARDS.realWorldProblemLogged,
    label: `Logged real-world problem: ${problem.title}`,
    refId: problem.id,
    profilePatch: { realWorldProblemsLogged: (current?.realWorldProblemsLogged ?? 0) + 1 },
  })
}

export async function logEngineeringDecision(
  uid: string,
  repos: Repositories,
  decision: EngineeringDecision,
) {
  await repos.engineeringDecisions.upsert(decision)
  const current = await repos.userProfile.get()
  return awardAndLog(uid, repos, {
    type: 'decision-logged',
    xpEarned: XP_REWARDS.engineeringDecisionLogged,
    label: `Logged engineering decision: ${decision.title}`,
    refId: decision.id,
    profilePatch: { engineeringDecisionsLogged: (current?.engineeringDecisionsLogged ?? 0) + 1 },
  })
}
