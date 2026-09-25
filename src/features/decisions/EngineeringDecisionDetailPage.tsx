import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { PROJECTS_BY_ID } from '@/config/projects'
import { useCollectionData } from '@/hooks/useCollectionData'

export function EngineeringDecisionDetailPage() {
  const { decisionId = '' } = useParams<{ decisionId: string }>()
  const navigate = useNavigate()
  const { items: decisions, loading } = useCollectionData((repos) =>
    repos.engineeringDecisions.list(),
  )

  if (loading) return <PageSpinner />
  const decision = decisions.find((d) => d.id === decisionId)
  if (!decision)
    return (
      <EmptyState
        title="Decision not found"
        action={<Link to="/decisions">Back to Engineering Decisions</Link>}
      />
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{decision.title}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Badge tone="neutral">{PROJECTS_BY_ID[decision.projectId]?.name}</Badge>
        </div>
      </div>

      <Card>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            marginBottom: 4,
          }}
        >
          PROBLEM
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {decision.problem}
        </p>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            marginBottom: 4,
          }}
        >
          CONTEXT
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{decision.context}</p>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Options considered</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {decision.options.map((option) => (
            <div
              key={option.id}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${option.id === decision.chosenOptionId ? 'var(--accent-primary)' : 'var(--border-default)'}`,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13.5,
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                {option.name}
                {option.id === decision.chosenOptionId ? <Badge tone="accent">Chosen</Badge> : null}
              </div>
              {option.advantages.length > 0 || option.disadvantages.length > 0 ? (
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12.5 }}>
                  {option.advantages.length > 0 ? (
                    <div>
                      <div style={{ color: 'var(--success)', fontWeight: 600 }}>Pros</div>
                      <ul
                        style={{
                          paddingLeft: 16,
                          listStyle: 'disc',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {option.advantages.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {option.disadvantages.length > 0 ? (
                    <div>
                      <div style={{ color: 'var(--danger)', fontWeight: 600 }}>Cons</div>
                      <ul
                        style={{
                          paddingLeft: 16,
                          listStyle: 'disc',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {option.disadvantages.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            marginBottom: 4,
          }}
        >
          WHY
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {decision.reason}
        </p>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            marginBottom: 4,
          }}
        >
          TRADEOFFS
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {decision.tradeoffs}
        </p>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            marginBottom: 4,
          }}
        >
          OUTCOME
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{decision.outcome}</p>
      </Card>

      <Button variant="ghost" onClick={() => navigate('/decisions')}>
        Back to Engineering Decisions
      </Button>
    </div>
  )
}
