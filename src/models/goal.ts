export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom'
export type GoalStatus = 'active' | 'completed' | 'missed' | 'archived'
export type GoalMetric =
  | 'minutes-studied'
  | 'lessons-completed'
  | 'quizzes-completed'
  | 'challenges-completed'
  | 'xp-earned'

export interface Goal {
  id: string
  userId: string
  title: string
  period: GoalPeriod
  metric: GoalMetric
  target: number
  progress: number
  status: GoalStatus
  startDate: string
  dueDate: string
  createdAt: string
}
