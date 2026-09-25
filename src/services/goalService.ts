import type { Activity, Goal } from '@/models'

/** Goal progress is computed from activity history in the goal's date range, not trusted as a stale stored field. */
export function computeGoalProgress(goal: Goal, activities: Activity[]): number {
  const inRange = activities.filter((a) => a.date >= goal.startDate && a.date <= goal.dueDate)

  switch (goal.metric) {
    case 'xp-earned':
      return inRange.reduce((sum, a) => sum + a.xpEarned, 0)
    case 'minutes-studied':
      return Math.round(inRange.reduce((sum, a) => sum + a.xpEarned, 0) / 2)
    case 'lessons-completed':
      return inRange.filter((a) => a.type === 'lesson-completed').length
    case 'quizzes-completed':
      return inRange.filter((a) => a.type === 'quiz-completed').length
    case 'challenges-completed':
      return inRange.filter((a) => a.type === 'challenge-completed').length
  }
}

export function goalStatus(goal: Goal, progress: number, today: string): Goal['status'] {
  if (progress >= goal.target) return 'completed'
  if (today > goal.dueDate) return 'missed'
  return 'active'
}
