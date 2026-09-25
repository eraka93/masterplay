import { STREAK_CONFIG } from '@/config/xp'
import type { Activity, DayActivitySummary } from '@/models'
import { isoDateRangeEndingToday, startOfMonthIso, startOfWeekIso, todayIso } from '@/utils/date'

export function xpByDate(activities: Activity[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const activity of activities) {
    map.set(activity.date, (map.get(activity.date) ?? 0) + activity.xpEarned)
  }
  return map
}

export function xpInDateRange(
  activities: Activity[],
  startInclusive: string,
  endInclusive: string,
): number {
  return activities
    .filter((activity) => activity.date >= startInclusive && activity.date <= endInclusive)
    .reduce((sum, activity) => sum + activity.xpEarned, 0)
}

export function xpToday(activities: Activity[]): number {
  const today = todayIso()
  return xpInDateRange(activities, today, today)
}

export function xpThisWeek(activities: Activity[]): number {
  const today = todayIso()
  return xpInDateRange(activities, startOfWeekIso(today), today)
}

export function xpThisMonth(activities: Activity[]): number {
  const today = todayIso()
  return xpInDateRange(activities, startOfMonthIso(today), today)
}

export function contributionGraphData(activities: Activity[], days = 365): DayActivitySummary[] {
  const byDate = xpByDate(activities)
  return isoDateRangeEndingToday(days).map((date) => {
    const xp = byDate.get(date) ?? 0
    return {
      date,
      xp,
      minutesStudied: Math.round(xp / 2),
      countedTowardStreak: xp >= STREAK_CONFIG.minXpPerDay,
    }
  })
}

/** 0-4 intensity bucket, matching a GitHub-style contribution graph's 5 shades. */
export function intensityBucket(xp: number): 0 | 1 | 2 | 3 | 4 {
  if (xp <= 0) return 0
  if (xp < 15) return 1
  if (xp < 35) return 2
  if (xp < 60) return 3
  return 4
}
