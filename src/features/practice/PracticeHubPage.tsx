import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { cardClassName } from '@/components/ui/Card'
import { SUBJECTS_BY_ID } from '@/config/subjects'
import { CHALLENGES } from '@/data/content/challenges'
import { useCollectionData } from '@/hooks/useCollectionData'

import styles from './PracticeHubPage.module.css'

const DIFFICULTY_TONE = { easy: 'success', medium: 'warning', hard: 'danger' } as const

export function PracticeHubPage() {
  const { items: attempts } = useCollectionData((repos) => repos.challengeAttempts.list())
  const completedIds = new Set(attempts.map((attempt) => attempt.challengeId))

  return (
    <div className={styles.page}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 640 }}>
        Daily technical challenges — debugging scenarios, architecture decisions,
        predict-the-output, and more. Think it through before revealing the resolution.
      </p>
      <div className={styles.grid}>
        {CHALLENGES.map((challenge) => (
          <Link
            key={challenge.id}
            to={`/practice/${challenge.id}`}
            className={cardClassName({ interactive: true, className: styles.card })}
          >
            <div className={styles.cardTop}>
              <Badge tone={DIFFICULTY_TONE[challenge.difficulty]}>{challenge.difficulty}</Badge>
              {completedIds.has(challenge.id) ? <Badge tone="success">Done</Badge> : null}
            </div>
            <div className={styles.cardTitle}>{challenge.title}</div>
            <div className={styles.cardPrompt}>{challenge.prompt}</div>
            <div className={styles.cardFooter}>
              <span>{challenge.type.replace(/-/g, ' ')}</span>
              <span>{SUBJECTS_BY_ID[challenge.subjectId]?.shortTitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
