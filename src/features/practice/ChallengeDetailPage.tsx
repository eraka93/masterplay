import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { CHALLENGES_BY_ID } from '@/data/content/challenges'
import { useAuth } from '@/hooks/useAuth'
import { useCollectionData } from '@/hooks/useCollectionData'
import { useProgressActions } from '@/hooks/useProgressActions'

import styles from './ChallengeDetailPage.module.css'

type Stage = 'investigate' | 'approaches' | 'resolved'

export function ChallengeDetailPage() {
  const { challengeId = '' } = useParams<{ challengeId: string }>()
  const navigate = useNavigate()
  const { uid } = useAuth()
  const actions = useProgressActions()
  const { items: attempts, refresh } = useCollectionData((repos) => repos.challengeAttempts.list())

  const [stage, setStage] = useState<Stage>('investigate')
  const [selectedApproachId, setSelectedApproachId] = useState<string | null>(null)

  const challenge = CHALLENGES_BY_ID[challengeId]
  if (!challenge)
    return (
      <EmptyState
        title="Challenge not found"
        action={<Link to="/practice">Back to Practice</Link>}
      />
    )

  const previousAttempt = attempts.find((attempt) => attempt.challengeId === challenge.id)

  async function complete() {
    await actions.completeChallenge(
      {
        id: crypto.randomUUID(),
        challengeId: challenge!.id,
        userId: uid,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        // Firestore rejects `undefined` field values outright — omit the key entirely when no
        // approach was picked, rather than writing selectedApproachId: undefined.
        ...(selectedApproachId ? { selectedApproachId } : {}),
        matchedRecommended:
          challenge!.approaches.find((a) => a.id === selectedApproachId)?.recommended ?? false,
      },
      challenge!,
    )
    void refresh()
    setStage('resolved')
  }

  return (
    <div className={styles.page}>
      <div>
        <div className={styles.title}>{challenge.title}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Badge>{challenge.type.replace(/-/g, ' ')}</Badge>
          <Badge tone="neutral">{challenge.difficulty}</Badge>
          {previousAttempt ? <Badge tone="success">Completed</Badge> : null}
        </div>
      </div>

      <Card>
        <p className={styles.prompt}>{challenge.prompt}</p>
        {challenge.context ? <p className={styles.prompt}>{challenge.context}</p> : null}
        {challenge.code ? (
          <pre className={styles.codeSample}>
            <code>{challenge.code}</code>
          </pre>
        ) : null}
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
          Think it through first
        </div>
        <div className={styles.investigationList}>
          {challenge.investigationPrompts.map((prompt, index) => (
            <div key={index} className={styles.investigationItem}>
              {prompt}
            </div>
          ))}
        </div>
      </Card>

      {stage === 'investigate' ? (
        <Button variant="primary" onClick={() => setStage('approaches')}>
          Show possible approaches
        </Button>
      ) : null}

      {stage !== 'investigate' ? (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Possible approaches</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {challenge.approaches.map((approach) => {
              const showRecommended = stage === 'resolved' && approach.recommended
              let cls = styles.approach
              if (selectedApproachId === approach.id) cls += ` ${styles.approachSelected}`
              if (showRecommended) cls += ` ${styles.approachRecommended}`
              return (
                <button
                  key={approach.id}
                  className={cls}
                  onClick={() => setSelectedApproachId(approach.id)}
                  disabled={stage === 'resolved'}
                >
                  <span className={styles.approachTitle}>
                    {approach.title}
                    {showRecommended ? ' — Recommended' : ''}
                  </span>
                  <span className={styles.approachDescription}>{approach.description}</span>
                </button>
              )
            })}
          </div>
        </Card>
      ) : null}

      {stage === 'approaches' ? (
        <Button
          variant="primary"
          onClick={() => void complete()}
          disabled={Boolean(previousAttempt)}
        >
          {previousAttempt ? 'Already logged' : 'Reveal resolution & mark complete'}
        </Button>
      ) : null}

      {stage === 'resolved' || previousAttempt ? (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Resolution</div>
          <p className={styles.resolution}>{challenge.resolution}</p>
        </Card>
      ) : null}

      <Button variant="ghost" onClick={() => navigate('/practice')}>
        Back to Practice
      </Button>
    </div>
  )
}
