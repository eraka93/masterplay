export type AchievementCategory = 'milestone' | 'streak' | 'mastery' | 'exploration' | 'craft'

export interface Achievement {
  id: string
  title: string
  description: string
  category: AchievementCategory
  icon: string
  /** Sort weight within its category for display; lower shows first. */
  order: number
}

export interface UserAchievement {
  achievementId: string
  userId: string
  unlockedAt: string
}
