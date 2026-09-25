import type { Goal } from '@/models'
import { addDaysIso, startOfMonthIso, startOfWeekIso, todayIso } from '@/utils/date'

export function createSeedGoals(uid: string): Goal[] {
  const today = todayIso()
  return [
    {
      id: 'goal-daily-minutes',
      userId: uid,
      title: 'Study 60 minutes today',
      period: 'daily',
      metric: 'minutes-studied',
      target: 60,
      progress: 0,
      status: 'active',
      startDate: today,
      dueDate: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-weekly-lessons',
      userId: uid,
      title: 'Finish 3 lessons this week',
      period: 'weekly',
      metric: 'lessons-completed',
      target: 3,
      progress: 0,
      status: 'active',
      startDate: startOfWeekIso(today),
      dueDate: addDaysIso(startOfWeekIso(today), 6),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-monthly-module',
      userId: uid,
      title: 'Complete the React Native Architecture module this month',
      period: 'monthly',
      metric: 'lessons-completed',
      target: 6,
      progress: 0,
      status: 'active',
      startDate: startOfMonthIso(today),
      dueDate: addDaysIso(startOfMonthIso(today), 29),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-debugging-challenges',
      userId: uid,
      title: 'Solve 5 debugging challenges',
      period: 'custom',
      metric: 'challenges-completed',
      target: 5,
      progress: 0,
      status: 'active',
      startDate: today,
      dueDate: addDaysIso(today, 13),
      createdAt: new Date().toISOString(),
    },
  ]
}
