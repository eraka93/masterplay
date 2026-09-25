/**
 * Single source of truth for XP rewards. Nothing in the UI should hardcode an XP number —
 * award values are looked up here so tuning the economy never means hunting through components.
 */
export const XP_REWARDS = {
  appOpenedToday: 5,
  lessonCompleted: 20,
  quizCompleted: 20,
  quizPerfectBonus: 10,
  challengeCompleted: 30,
  realWorldProblemLogged: 30,
  engineeringDecisionLogged: 25,
  studySession10Min: 10,
  goalCompleted: 15,
} as const

export const STREAK_BONUSES: { days: number; xp: number }[] = [
  { days: 7, xp: 50 },
  { days: 14, xp: 75 },
  { days: 30, xp: 150 },
  { days: 60, xp: 250 },
  { days: 100, xp: 400 },
  { days: 365, xp: 1500 },
]

/** Minimum daily signal that counts a day toward the streak. Configurable, not hardcoded per-view. */
export const STREAK_CONFIG = {
  minXpPerDay: 10,
} as const

export type XpRewardKey = keyof typeof XP_REWARDS
