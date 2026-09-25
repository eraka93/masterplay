export type ActivityType =
  | 'lesson-completed'
  | 'quiz-completed'
  | 'challenge-completed'
  | 'problem-logged'
  | 'decision-logged'
  | 'study-session'
  | 'app-opened'
  | 'streak-bonus'
  | 'achievement-unlocked'

export interface Activity {
  id: string
  userId: string
  type: ActivityType
  /** ISO date (YYYY-MM-DD) — the day this activity counts toward, for the contribution graph. */
  date: string
  timestamp: string
  xpEarned: number
  /** Human-readable label, e.g. "Completed lesson: JSI in React Native". */
  label: string
  subjectId?: string
  refId?: string
}

/** One cell of the GitHub-style contribution graph. */
export interface DayActivitySummary {
  date: string
  xp: number
  minutesStudied: number
  countedTowardStreak: boolean
}

export type StudySessionSubjectRef =
  | { kind: 'lesson'; id: string }
  | { kind: 'challenge'; id: string }
  | { kind: 'topic'; id: string }
  | { kind: 'general' }

export interface StudySession {
  id: string
  userId: string
  subjectRef: StudySessionSubjectRef
  startedAt: string
  endedAt: string | null
  /** Sum of active (non-paused) seconds. */
  activeSeconds: number
  status: 'active' | 'paused' | 'completed'
}
