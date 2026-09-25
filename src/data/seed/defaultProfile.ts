import type { UserProfile } from '@/models'
import { todayIso } from '@/utils/date'

export function createDefaultProfile(uid: string): UserProfile {
  return {
    id: uid,
    displayName: 'Milan',
    email: '',
    createdAt: new Date().toISOString(),

    totalXp: 0,

    currentStreakDays: 0,
    longestStreakDays: 0,
    lastActiveDate: null,

    lessonsCompleted: 0,
    quizzesCompleted: 0,
    challengesCompleted: 0,
    performanceChallengesCompleted: 0,
    realWorldProblemsLogged: 0,
    engineeringDecisionsLogged: 0,
    averageQuizScorePercent: 0,

    totalStudyMinutes: 0,
    weeklyStudyMinutes: 0,
    monthlyStudyMinutes: 0,

    strongestSubjectIds: [],
    weakestSubjectIds: [],

    currentLearningPathId: 'senior-mobile-engineer',
    activeGoalIds: [],
  }
}

export function createTodayDate(): string {
  return todayIso()
}
