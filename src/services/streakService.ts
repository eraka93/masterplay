import { STREAK_CONFIG } from '@/config/xp'
import { yesterdayOf } from '@/utils/date'

export interface StreakState {
  currentStreakDays: number
  longestStreakDays: number
  lastActiveDate: string | null
}

/**
 * Pure streak transition function. A day only counts once its cumulative XP crosses
 * STREAK_CONFIG.minXpPerDay (see section 19 of the spec: "minimum learning requirement").
 * Idempotent: calling this multiple times for the same `today` after the threshold is already
 * met returns the same state, so callers can safely recompute on every activity write.
 */
export function computeStreakAfterActivity(
  previous: StreakState,
  today: string,
  todayTotalXp: number,
): StreakState {
  if (todayTotalXp < STREAK_CONFIG.minXpPerDay) {
    return previous
  }
  if (previous.lastActiveDate === today) {
    return previous
  }

  const wasConsecutive = previous.lastActiveDate === yesterdayOf(today)
  const currentStreakDays = wasConsecutive ? previous.currentStreakDays + 1 : 1
  const longestStreakDays = Math.max(previous.longestStreakDays, currentStreakDays)

  return { currentStreakDays, longestStreakDays, lastActiveDate: today }
}

/** Streak is considered "at risk of breaking" once a day has passed without qualifying activity. */
export function isStreakAtRisk(previous: StreakState, today: string): boolean {
  if (!previous.lastActiveDate) return false
  return previous.lastActiveDate !== today && previous.lastActiveDate !== yesterdayOf(today)
    ? false // already broken, not "at risk" — it's over
    : previous.lastActiveDate === yesterdayOf(today)
}
