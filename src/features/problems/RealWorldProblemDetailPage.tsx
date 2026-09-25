import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { PROJECTS_BY_ID } from '@/config/projects'
import { useCollectionData } from '@/hooks/useCollectionData'

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--text-tertiary)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontSize: 13.5,
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {value}
      </p>
    </div>
  )
}

export function RealWorldProblemDetailPage() {
  const { problemId = '' } = useParams<{ problemId: string }>()
  const navigate = useNavigate()
  const { items: problems, loading } = useCollectionData((repos) => repos.realWorldProblems.list())

  if (loading) return <PageSpinner />
  const problem = problems.find((p) => p.id === problemId)
  if (!problem)
    return (
      <EmptyState
        title="Problem not found"
        action={<Link to="/problems">Back to Real World Problems</Link>}
      />
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{problem.title}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <Badge tone="neutral">{PROJECTS_BY_ID[problem.projectId]?.name}</Badge>
          <Badge>{problem.difficulty}</Badge>
          <Badge tone="neutral">{problem.timeSpentMinutes} min</Badge>
          {problem.technologies.map((tech) => (
            <Badge key={tech} tone="accent">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <Field label="Problem description" value={problem.problemDescription} />
        <Field label="Symptoms" value={problem.symptoms} />
        <Field label="Error messages" value={problem.errorMessages} />
        <Field label="Initial hypothesis" value={problem.initialHypothesis} />
        <Field label="Investigation" value={problem.investigation} />
        <Field label="Final cause" value={problem.finalCause} />
        <Field label="Solution" value={problem.solution} />
        <Field label="What I learned" value={problem.whatILearned} />
      </Card>

      {problem.codeBefore || problem.codeAfter ? (
        <Card>
          {problem.codeBefore ? (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  marginBottom: 6,
                }}
              >
                BEFORE
              </div>
              <pre
                style={{
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 12.5,
                  overflowX: 'auto',
                }}
              >
                <code>{problem.codeBefore}</code>
              </pre>
            </div>
          ) : null}
          {problem.codeAfter ? (
            <div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  marginBottom: 6,
                }}
              >
                AFTER
              </div>
              <pre
                style={{
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 12.5,
                  overflowX: 'auto',
                }}
              >
                <code>{problem.codeAfter}</code>
              </pre>
            </div>
          ) : null}
        </Card>
      ) : null}

      <Button variant="ghost" onClick={() => navigate('/problems')}>
        Back to Real World Problems
      </Button>
    </div>
  )
}
