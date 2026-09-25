import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import formStyles from '@/components/ui/Form.module.css'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useCollectionData } from '@/hooks/useCollectionData'
import { useRepositories } from '@/hooks/useRepositories'
import type { Goal, GoalMetric, GoalPeriod } from '@/models'
import { computeGoalProgress, goalStatus } from '@/services/goalService'
import { addDaysIso, todayIso } from '@/utils/date'

import styles from './GoalsPage.module.css'

const METRIC_LABEL: Record<GoalMetric, string> = {
  'minutes-studied': 'minutes studied',
  'lessons-completed': 'lessons completed',
  'quizzes-completed': 'quizzes completed',
  'challenges-completed': 'challenges completed',
  'xp-earned': 'XP earned',
}

export function GoalsPage() {
  const {
    items: goals,
    loading: goalsLoading,
    refresh,
  } = useCollectionData((repos) => repos.goals.list())
  const { items: activities, loading: activitiesLoading } = useCollectionData((repos) =>
    repos.activities.list(),
  )
  const [showForm, setShowForm] = useState(false)

  if (goalsLoading || activitiesLoading) return <PageSpinner />

  const today = todayIso()
  const enriched = goals.map((goal) => {
    const progress = computeGoalProgress(goal, activities)
    return { goal, progress, status: goalStatus(goal, progress, today) }
  })
  const active = enriched.filter((g) => g.status === 'active')
  const completed = enriched.filter((g) => g.status === 'completed')
  const missed = enriched.filter((g) => g.status === 'missed')

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 560 }}>
          Daily, weekly, monthly, and custom targets to keep progress measurable.
        </p>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New goal'}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <NewGoalForm
            onSaved={() => {
              setShowForm(false)
              void refresh()
            }}
          />
        </Card>
      ) : null}

      <section>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Active</div>
        {active.length === 0 ? (
          <EmptyState
            title="No active goals"
            description="Create one above to start tracking progress."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.map(({ goal, progress }) => (
              <Card key={goal.id} className={styles.goalCard}>
                <div className={styles.goalTop}>
                  <span className={styles.goalTitle}>{goal.title}</span>
                  <Badge tone="accent">{goal.period}</Badge>
                </div>
                <ProgressBar percent={(progress / goal.target) * 100} thin />
                <div className={styles.goalMeta}>
                  {progress}/{goal.target} {METRIC_LABEL[goal.metric]} · due {goal.dueDate}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 ? (
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Completed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {completed.map(({ goal, progress }) => (
              <Card key={goal.id} className={styles.goalCard}>
                <div className={styles.goalTop}>
                  <span className={styles.goalTitle}>{goal.title}</span>
                  <Badge tone="success">Done</Badge>
                </div>
                <div className={styles.goalMeta}>
                  {progress}/{goal.target} {METRIC_LABEL[goal.metric]}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {missed.length > 0 ? (
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Missed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {missed.map(({ goal, progress }) => (
              <Card key={goal.id} className={styles.goalCard}>
                <div className={styles.goalTop}>
                  <span className={styles.goalTitle}>{goal.title}</span>
                  <Badge tone="danger">Missed</Badge>
                </div>
                <div className={styles.goalMeta}>
                  {progress}/{goal.target} {METRIC_LABEL[goal.metric]}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function NewGoalForm({ onSaved }: { onSaved: () => void }) {
  const { uid } = useAuth()
  const repos = useRepositories()
  const [title, setTitle] = useState('')
  const [period, setPeriod] = useState<GoalPeriod>('daily')
  const [metric, setMetric] = useState<GoalMetric>('minutes-studied')
  const [target, setTarget] = useState(30)
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return
    setSaving(true)
    const today = todayIso()
    const days = period === 'daily' ? 0 : period === 'weekly' ? 6 : period === 'monthly' ? 29 : 13
    const goal: Goal = {
      id: crypto.randomUUID(),
      userId: uid,
      title: title.trim(),
      period,
      metric,
      target,
      progress: 0,
      status: 'active',
      startDate: today,
      dueDate: addDaysIso(today, days),
      createdAt: new Date().toISOString(),
    }
    await repos.goals.upsert(goal)
    setSaving(false)
    onSaved()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Title</label>
        <input
          className={formStyles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Study 45 minutes today"
        />
      </div>
      <div className={formStyles.row}>
        <div className={formStyles.field}>
          <label className={formStyles.label}>Period</label>
          <select
            className={formStyles.select}
            value={period}
            onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom (14 days)</option>
          </select>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>Metric</label>
          <select
            className={formStyles.select}
            value={metric}
            onChange={(e) => setMetric(e.target.value as GoalMetric)}
          >
            {Object.entries(METRIC_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>Target</label>
          <input
            type="number"
            className={formStyles.input}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          />
        </div>
      </div>
      <Button
        variant="primary"
        disabled={saving || !title.trim()}
        onClick={() => void handleSubmit()}
      >
        {saving ? 'Saving...' : 'Create goal'}
      </Button>
    </div>
  )
}
