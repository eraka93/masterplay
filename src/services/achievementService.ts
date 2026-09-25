import { ACHIEVEMENTS } from '@/config/achievements'
import type { SubjectSlug, UserProfile } from '@/models'

export interface AchievementCheckContext {
  profile: UserProfile
  lastQuizPerfect: boolean
  masteryBySubject: ReadonlyMap<SubjectSlug, number>
  alreadyUnlockedIds: Set<string>
}

const SUBJECT_ACHIEVEMENT_SUBJECTS: Record<string, SubjectSlug[]> = {
  'javascript-explorer': ['javascript-deep-dive'],
  'typescript-explorer': ['typescript-deep-dive'],
  'react-expert': ['react-internals'],
  'react-native-explorer': ['react-native-fundamentals', 'react-native-advanced'],
  'jsi-explorer': ['jsi'],
  'android-explorer': ['android-fundamentals'],
  'ios-explorer': ['ios-fundamentals'],
}

/** Pure predicate evaluation — returns achievement ids newly earned this check, not yet unlocked. */
export function evaluateNewlyUnlockedAchievements(context: AchievementCheckContext): string[] {
  const { profile, lastQuizPerfect, masteryBySubject, alreadyUnlockedIds } = context
  const unlocked: string[] = []

  const check = (id: string, condition: boolean) => {
    if (condition && !alreadyUnlockedIds.has(id)) unlocked.push(id)
  }

  check('first-lesson', profile.lessonsCompleted >= 1)
  check('first-quiz', profile.quizzesCompleted >= 1)
  check('perfect-score', lastQuizPerfect)
  check('streak-7', profile.currentStreakDays >= 7)
  check('streak-30', profile.currentStreakDays >= 30)
  check('streak-100', profile.currentStreakDays >= 100)
  check('lessons-100', profile.lessonsCompleted >= 100)
  check('performance-detective', profile.performanceChallengesCompleted >= 5)
  check('bug-hunter', profile.realWorldProblemsLogged >= 10)
  check('architecture-thinker', profile.engineeringDecisionsLogged >= 10)

  for (const [achievementId, subjectIds] of Object.entries(SUBJECT_ACHIEVEMENT_SUBJECTS)) {
    const complete = subjectIds.every((id) => (masteryBySubject.get(id) ?? 0) >= 100)
    check(achievementId, complete)
  }

  return unlocked.filter((id) => ACHIEVEMENTS.some((achievement) => achievement.id === id))
}
