import { SUBJECTS } from '@/config/subjects'
import type { Activity, ActivityType, UserProfile } from '@/models'
import { computeStreakAfterActivity, type StreakState } from '@/services/streakService'
import { addDaysIso, todayIso } from '@/utils/date'

const DEMO_DAYS = 365

/** Small deterministic PRNG so demo data is stable across reloads of the same install. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ACTIVITY_LABELS: {
  type: ActivityType
  label: (subject: string) => string
  minXp: number
  maxXp: number
}[] = [
  { type: 'lesson-completed', label: (s) => `Completed a lesson in ${s}`, minXp: 20, maxXp: 20 },
  { type: 'quiz-completed', label: (s) => `Completed a quiz on ${s}`, minXp: 20, maxXp: 30 },
  { type: 'challenge-completed', label: () => 'Completed a daily challenge', minXp: 30, maxXp: 30 },
  { type: 'study-session', label: (s) => `Studied ${s}`, minXp: 10, maxXp: 40 },
]

/**
 * Generates ~1 year of plausible activity history so the dashboard's contribution graph and
 * stats are meaningful on first launch (spec section 32: demo/seed data). Ends the day *before*
 * today, so the first real `recordAppOpen` on first launch extends a streak that's already
 * mid-flight — a more honest demonstration of the streak mechanic than starting from zero.
 */
export function generateDemoActivities(uid: string): {
  activities: Activity[]
  profilePatch: Partial<UserProfile>
} {
  const rand = mulberry32(20260101)
  const activities: Activity[] = []
  const lastDay = addDaysIso(todayIso(), -1)
  const firstDay = addDaysIso(lastDay, -(DEMO_DAYS - 1))

  let lessonsCompleted = 0
  let quizzesCompleted = 0
  let challengesCompleted = 0
  let scoreSum = 0
  let scoreCount = 0
  let totalStudyMinutes = 0

  let streak: StreakState = { currentStreakDays: 0, longestStreakDays: 0, lastActiveDate: null }
  const dailyXp = new Map<string, number>()

  for (let i = 0; i < DEMO_DAYS; i += 1) {
    const date = addDaysIso(firstDay, i)
    const daysFromEnd = DEMO_DAYS - i
    // Activity gets denser in the most recent ~8 weeks to tell a "ramping up" story.
    const recentBoost = daysFromEnd <= 56 ? 0.3 : 0
    const activeProbability = 0.45 + recentBoost
    if (rand() > activeProbability) continue

    const entriesToday = 1 + Math.floor(rand() * (daysFromEnd <= 56 ? 3 : 2))
    let dayXp = 0

    for (let j = 0; j < entriesToday; j += 1) {
      const kind = ACTIVITY_LABELS[Math.floor(rand() * ACTIVITY_LABELS.length)]!
      const subject = SUBJECTS[Math.floor(rand() * SUBJECTS.length)]!
      const xp = Math.round(kind.minXp + rand() * (kind.maxXp - kind.minXp))
      dayXp += xp

      activities.push({
        id: `${date}-${j}-${kind.type}`,
        userId: uid,
        type: kind.type,
        date,
        timestamp: `${date}T${String(9 + j * 3).padStart(2, '0')}:00:00.000Z`,
        xpEarned: xp,
        label: kind.label(subject.shortTitle),
        subjectId: subject.id,
      })

      if (kind.type === 'lesson-completed') lessonsCompleted += 1
      if (kind.type === 'quiz-completed') {
        quizzesCompleted += 1
        const score = 60 + Math.floor(rand() * 41)
        scoreSum += score
        scoreCount += 1
      }
      if (kind.type === 'challenge-completed') challengesCompleted += 1
      if (kind.type === 'study-session') totalStudyMinutes += 10 + Math.floor(rand() * 30)
    }

    dailyXp.set(date, dayXp)
    streak = computeStreakAfterActivity(streak, date, dayXp)
  }

  const last30 = Array.from({ length: 30 }, (_, i) => addDaysIso(lastDay, -i))
  const last7 = last30.slice(0, 7)
  const weeklyStudyMinutes = last7.reduce(
    (sum, d) => sum + estimateMinutesFromXp(dailyXp.get(d) ?? 0),
    0,
  )
  const monthlyStudyMinutes = last30.reduce(
    (sum, d) => sum + estimateMinutesFromXp(dailyXp.get(d) ?? 0),
    0,
  )

  return {
    activities,
    profilePatch: {
      totalXp: activities.reduce((sum, a) => sum + a.xpEarned, 0),
      currentStreakDays: streak.currentStreakDays,
      longestStreakDays: streak.longestStreakDays,
      lastActiveDate: streak.lastActiveDate,
      lessonsCompleted,
      quizzesCompleted,
      challengesCompleted,
      averageQuizScorePercent: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0,
      totalStudyMinutes,
      weeklyStudyMinutes,
      monthlyStudyMinutes,
      strongestSubjectIds: [
        'javascript-deep-dive',
        'react-native-fundamentals',
        'typescript-deep-dive',
      ],
      weakestSubjectIds: ['android-fundamentals', 'ios-fundamentals', 'system-design'],
    },
  }
}

function estimateMinutesFromXp(xp: number): number {
  // Rough conversion for demo stats only: ~1 minute of study per 2 XP earned that day.
  return Math.round(xp / 2)
}
