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
import type { ProblemDifficulty, ProjectId, RealWorldProblem } from '@/models'
import { formatRelativeDate } from '@/utils/date'

const DIFFICULTY_TONE: Record<ProblemDifficulty, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
  brutal: 'danger',
}

export function RealWorldProblemsPage() {
  const {
    items: problems,
    loading,
    refresh,
  } = useCollectionData((repos) => repos.realWorldProblems.list())
  const [showForm, setShowForm] = useState(false)

  if (loading) return <PageSpinner />

  const sorted = [...problems].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 560 }}>
          Real engineering problems you've actually debugged — the investigation, not just the fix.
        </p>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Log a problem'}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <NewProblemForm
            onSaved={() => {
              setShowForm(false)
              void refresh()
            }}
          />
        </Card>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState
          title="No problems logged yet"
          description="Log your first real-world problem above."
        />
      ) : (
        <div className={styles.list}>
          {sorted.map((problem) => (
            <Link
              key={problem.id}
              to={`/problems/${problem.id}`}
              className={cardClassName({ interactive: true, className: styles.row })}
            >
              <div className={styles.rowMeta}>
                <span className={styles.rowTitle}>{problem.title}</span>
                <span className={styles.rowSub}>
                  {problem.projectId} · {formatRelativeDate(problem.date)}
                </span>
              </div>
              <Badge tone={DIFFICULTY_TONE[problem.difficulty]}>{problem.difficulty}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function NewProblemForm({ onSaved }: { onSaved: () => void }) {
  const actions = useProgressActions()
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState<ProjectId>('personal')
  const [technologies, setTechnologies] = useState('')
  const [problemDescription, setProblemDescription] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [finalCause, setFinalCause] = useState('')
  const [solution, setSolution] = useState('')
  const [whatILearned, setWhatILearned] = useState('')
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('medium')
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(60)
  const [wouldSolveFasterToday, setWouldSolveFasterToday] = useState(true)
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return
    setSaving(true)
    const problem: RealWorldProblem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      projectId,
      technologies: technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      date: new Date().toISOString().slice(0, 10),
      problemDescription,
      symptoms,
      initialHypothesis: '',
      possibleCauses: [],
      investigation: '',
      finalCause,
      solution,
      whatILearned,
      tags: [],
      difficulty,
      timeSpentMinutes,
      wouldSolveFasterToday,
      createdAt: new Date().toISOString(),
    }
    await actions.logRealWorldProblem(problem)
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
          placeholder="What broke?"
        />
      </div>
      <div className={formStyles.row}>
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
        <div className={formStyles.field}>
          <label className={formStyles.label}>Difficulty</label>
          <select
            className={formStyles.select}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="brutal">Brutal</option>
          </select>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>Time spent (min)</label>
          <input
            type="number"
            className={formStyles.input}
            value={timeSpentMinutes}
            onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
          />
        </div>
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Technologies (comma separated)</label>
        <input
          className={formStyles.input}
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Problem description</label>
        <textarea
          className={formStyles.textarea}
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Symptoms</label>
        <textarea
          className={formStyles.textarea}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Final cause</label>
        <textarea
          className={formStyles.textarea}
          value={finalCause}
          onChange={(e) => setFinalCause(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>Solution</label>
        <textarea
          className={formStyles.textarea}
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
        />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label}>What I learned</label>
        <textarea
          className={formStyles.textarea}
          value={whatILearned}
          onChange={(e) => setWhatILearned(e.target.value)}
        />
      </div>
      <label className={formStyles.checkboxRow}>
        <input
          type="checkbox"
          checked={wouldSolveFasterToday}
          onChange={(e) => setWouldSolveFasterToday(e.target.checked)}
        />
        Would solve this faster today
      </label>
      <Button
        variant="primary"
        onClick={() => void handleSubmit()}
        disabled={saving || !title.trim()}
      >
        {saving ? 'Saving...' : 'Save problem (+30 XP)'}
      </Button>
    </div>
  )
}
