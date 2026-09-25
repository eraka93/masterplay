import { describe, expect, it } from 'vitest'

import { computeStreakAfterActivity, type StreakState } from './streakService'

const EMPTY: StreakState = { currentStreakDays: 0, longestStreakDays: 0, lastActiveDate: null }

describe('computeStreakAfterActivity', () => {
  it('does nothing if today has not crossed the minimum XP threshold', () => {
    const result = computeStreakAfterActivity(EMPTY, '2026-01-05', 5)
    expect(result).toEqual(EMPTY)
  })

  it('starts a streak at 1 on the first qualifying day', () => {
    const result = computeStreakAfterActivity(EMPTY, '2026-01-05', 20)
    expect(result).toEqual({
      currentStreakDays: 1,
      longestStreakDays: 1,
      lastActiveDate: '2026-01-05',
    })
  })

  it('increments the streak on a consecutive day', () => {
    const previous: StreakState = {
      currentStreakDays: 3,
      longestStreakDays: 5,
      lastActiveDate: '2026-01-05',
    }
    const result = computeStreakAfterActivity(previous, '2026-01-06', 20)
    expect(result).toEqual({
      currentStreakDays: 4,
      longestStreakDays: 5,
      lastActiveDate: '2026-01-06',
    })
  })

  it('updates the longest streak when the current streak surpasses it', () => {
    const previous: StreakState = {
      currentStreakDays: 5,
      longestStreakDays: 5,
      lastActiveDate: '2026-01-05',
    }
    const result = computeStreakAfterActivity(previous, '2026-01-06', 20)
    expect(result.longestStreakDays).toBe(6)
  })

  it('resets the streak to 1 after a missed day', () => {
    const previous: StreakState = {
      currentStreakDays: 10,
      longestStreakDays: 10,
      lastActiveDate: '2026-01-01',
    }
    const result = computeStreakAfterActivity(previous, '2026-01-05', 20)
    expect(result.currentStreakDays).toBe(1)
    expect(result.longestStreakDays).toBe(10)
  })

  it('is idempotent for repeated calls on the same qualifying day', () => {
    const first = computeStreakAfterActivity(EMPTY, '2026-01-05', 20)
    const second = computeStreakAfterActivity(first, '2026-01-05', 40)
    expect(second).toEqual(first)
  })
})
