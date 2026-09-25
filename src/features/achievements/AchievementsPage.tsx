import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { ACHIEVEMENTS } from '@/config/achievements'
import { useCollectionData } from '@/hooks/useCollectionData'

import styles from './AchievementsPage.module.css'

const CATEGORY_LABEL = {
  milestone: 'Milestones',
  streak: 'Streaks',
  mastery: 'Mastery',
  exploration: 'Exploration',
  craft: 'Craft',
} as const

export function AchievementsPage() {
  const { items: unlocked, loading } = useCollectionData((repos) => repos.userAchievements.list())
  if (loading) return <PageSpinner />

  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]))

  return (
    <div className={styles.page}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
        {unlocked.length} of {ACHIEVEMENTS.length} unlocked.
      </p>
      {(Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[]).map((category) => {
        const items = ACHIEVEMENTS.filter((a) => a.category === category).sort(
          (a, b) => a.order - b.order,
        )
        if (items.length === 0) return null
        return (
          <section key={category}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
              {CATEGORY_LABEL[category]}
            </div>
            <div className={styles.grid}>
              {items.map((achievement) => {
                const isUnlocked = unlockedMap.has(achievement.id)
                return (
                  <Card
                    key={achievement.id}
                    className={`${styles.card} ${isUnlocked ? '' : styles.cardLocked}`}
                  >
                    <span className={styles.badge}>{achievement.icon}</span>
                    <div>
                      <div className={styles.cardTitle}>{achievement.title}</div>
                      <div className={styles.cardDescription}>{achievement.description}</div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
