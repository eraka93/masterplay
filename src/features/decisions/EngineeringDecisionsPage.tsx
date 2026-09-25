import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, cardClassName } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import formStyles from '@/components/ui/Form.module.css'
import styles from '@/components/ui/ListPage.module.css'
import { PageSpinner } from '@/components/ui/Spinner'
import { PROJECTS } from '@/config/projects'
import { useCollectionData } from '@/hooks/useCollectionData'
import { useProgressActions } from '@/hooks/useProgressActions'
import type { EngineeringDecision, ProjectId } from '@/models'
import { formatRelativeDate } from '@/utils/date'

export function EngineeringDecisionsPage() {
  const {
    items: decisions,
    loading,
    refresh,
  } = useCollectionData((repos) => repos.engineeringDecisions.list())
  const [showForm, setShowForm] = useState(false)

  if (loading) return <PageSpinner />
  const sorted = [...decisions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 560 }}>
          A log of real technical decisions — the options weighed, why one was chosen, and whether
          it held up.
        </p>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Log a decision'}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <NewDecisionForm
            onSaved={() => {
              setShowForm(false)
              void refresh()
            }}
          />
        </Card>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState
          title="No decisions logged yet"
          description="Log your first engineering decision above."
        />
      ) : (
        <div className={styles.list}>
          {sorted.map((decision) => (
            <Link
              key={decision.id}
              to={`/decisions/${decision.id}`}
              className={cardClassName({ interactive: true, className: styles.row })}
            >
              <div className={styles.rowMeta}>
                <span className={styles.rowTitle}>{decision.title}</span>
                <span className={styles.rowSub}>
                  {decision.projectId} · {formatRelativeDate(decision.date)}
                </span>
              </div>
              {decision.wouldChooseSameAgain !== null ? (
                <Badge tone={decision.wouldChooseSameAgain ? 'success' : 'warning'}>
                  {decision.wouldChooseSameAgain ? 'Still agree' : 'Would revisit'}
                </Badge>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function NewDecisionForm({ onSaved }: { onSaved: () => void }) {
  const actions = useProgressActions()
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState<ProjectId>('personal')
  const [problem, setProblem] = useState('')
  const [context, setContext] = useState('')
  const [optionAName, setOptionAName] = useState('')
  const [optionBName, setOptionBName] = useState('')
  const [reason, setReason] = useState('')
  const [tradeoffs, setTradeoffs] = useState('')
  const [outcome, setOutcome] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!title.trim() || !optionAName.trim() || !optionBName.trim()) return
    setSaving(true)
    const optionAId = crypto.randomUUID()
    const optionBId = crypto.randomUUID()
    const decision: EngineeringDecision = {
      id: crypto.randomUUID(),
      title: title.trim(),
      projectId,
      date: new Date().toISOString().slice(0, 10),
      problem,
      context,
      options: [
        { id: optionAId, name: optionAName, advantages: [], disadvantages: [] },
        { id: optionBId, name: optionBName, advantages: [], disadvantages: [] },
      ],
      chosenOptionId: optionAId,
      reason,
      tradeoffs,
      outcome,
      wouldChooseSameAgain: null,
      tags: [],
      createdAt: new Date().toISOString(),
    }
    await actions.logEngineeringDecision(decision)
    setSaving(false)
    onSaved()
  }

  return (
    <div className={styles.formGrid}>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Title</label>
        <input
          className={formStyles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Redux vs Zustand"
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Project</label>
        <select
          className={formStyles.select}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value as ProjectId)}
        >
          {PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className={formStyles.row}>
        <div className={formStyles.field}>
          <label className={formStyles.label}>Option A (chosen)</label>
          <input
            className={formStyles.input}
            value={optionAName}
            onChange={(e) => setOptionAName(e.target.value)}
          />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>Option B</label>
          <input
            className={formStyles.input}
            value={optionBName}
            onChange={(e) => setOptionBName(e.target.value)}
          />
        </div>
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Problem</label>
        <textarea
          className={formStyles.textarea}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Context</label>
        <textarea
          className={formStyles.textarea}
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Why this option</label>
        <textarea
          className={formStyles.textarea}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Tradeoffs</label>
        <textarea
          className={formStyles.textarea}
          value={tradeoffs}
          onChange={(e) => setTradeoffs(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Outcome so far</label>
        <textarea
          className={formStyles.textarea}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        />
      </div>
      <Button
        variant="primary"
        onClick={() => void handleSubmit()}
        disabled={saving || !title.trim()}
      >
        {saving ? 'Saving...' : 'Save decision (+25 XP)'}
      </Button>
    </div>
  )
}
