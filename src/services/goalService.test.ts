import { describe, expect, it } from 'vitest'

import type { Activity, Goal } from '@/models'

import { computeGoalProgress, goalStatus } from './goalService'

function activity(overrides: Partial<Activity>): Activity {
  return {
    id: crypto.randomUUID(),
    userId: 'u1',
    type: 'lesson-completed',
    date: '2026-01-05',
    timestamp: '2026-01-05T10:00:00.000Z',
    xpEarned: 20,
    label: 'test',
    ...overrides,
  }
}

function goal(overrides: Partial<Goal>): Goal {
  return {
    id: 'g1',
    userId: 'u1',
    title: 'Test goal',
    period: 'daily',
    metric: 'xp-earned',
    target: 50,
    progress: 0,
    status: 'active',
    startDate: '2026-01-01',
    dueDate: '2026-01-10',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('computeGoalProgress', () => {
  it('sums XP earned within the date range for an xp-earned goal', () => {
    const activities = [
      activity({ date: '2026-01-05', xpEarned: 20 }),
      activity({ date: '2026-01-06', xpEarned: 30 }),
      activity({ date: '2025-12-31', xpEarned: 100 }), // outside range
    ]
    expect(computeGoalProgress(goal({ metric: 'xp-earned' }), activities)).toBe(50)
  })

  it('counts only matching activity types for lessons-completed', () => {
    const activities = [
      activity({ date: '2026-01-05', type: 'lesson-completed' }),
      activity({ date: '2026-01-05', type: 'quiz-completed' }),
      activity({ date: '2026-01-05', type: 'lesson-completed' }),
    ]
    expect(computeGoalProgress(goal({ metric: 'lessons-completed' }), activities)).toBe(2)
  })
})

describe('goalStatus', () => {
  it('is completed once progress reaches the target', () => {
    expect(goalStatus(goal({ target: 50 }), 50, '2026-01-05')).toBe('completed')
  })

  it('is missed once the due date has passed without reaching target', () => {
    expect(goalStatus(goal({ target: 50, dueDate: '2026-01-05' }), 10, '2026-01-06')).toBe('missed')
  })

  it('is active otherwise', () => {
    expect(goalStatus(goal({ target: 50, dueDate: '2026-01-10' }), 10, '2026-01-05')).toBe('active')
  })
})
