import type { SubjectSlug } from './content'

export interface UserProfile {
  id: string
  displayName: string
  email: string
  avatarUrl?: string
  createdAt: string

  /** Lifetime XP. Current level and in-level progress are derived from this — see config/levels.ts. */
  totalXp: number

  currentStreakDays: number
  longestStreakDays: number
  lastActiveDate: string | null

  lessonsCompleted: number
  quizzesCompleted: number
  challengesCompleted: number
  performanceChallengesCompleted: number
  realWorldProblemsLogged: number
  engineeringDecisionsLogged: number
  averageQuizScorePercent: number

  totalStudyMinutes: number
  weeklyStudyMinutes: number
  monthlyStudyMinutes: number

  strongestSubjectIds: SubjectSlug[]
  weakestSubjectIds: SubjectSlug[]

  currentLearningPathId: string | null
  activeGoalIds: string[]
}

export interface DeveloperLevel {
  id: number
  title: string
  minXp: number
  /** Short line clarifying this is a gamification label, not a professional title. */
  tagline: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  targetLevelId: number
  subjectIds: SubjectSlug[]
}
