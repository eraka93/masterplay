import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { CheckIcon } from '@/components/ui/icons'
import { SUBJECTS_BY_ID } from '@/config/subjects'
import { LESSONS_BY_ID } from '@/data/content/lessons'
import { QUESTIONS_BY_ID } from '@/data/content/questions'
import { QUIZZES_BY_ID } from '@/data/content/quizzes'
import { useAuth } from '@/hooks/useAuth'
import { useCollectionData } from '@/hooks/useCollectionData'
import { useProgressActions } from '@/hooks/useProgressActions'
import { useRepositories } from '@/hooks/useRepositories'
import type { Question, QuestionResult } from '@/models'

import { LessonBlockRenderer } from './LessonBlockRenderer'
import styles from './LessonReaderPage.module.css'
import { QuizRunner } from './QuizRunner'

export function LessonReaderPage() {
  const { subjectId = '', lessonId = '' } = useParams<{ subjectId: string; lessonId: string }>()
  const navigate = useNavigate()
  const repos = useRepositories()
  const actions = useProgressActions()
  const { uid } = useAuth()

  const lesson = LESSONS_BY_ID[lessonId]
  const subject = SUBJECTS_BY_ID[subjectId]
  const quiz = lesson?.quizId ? QUIZZES_BY_ID[lesson.quizId] : undefined

  const { items: activities, refresh: refreshActivities } = useCollectionData((r) =>
    r.activities.list(),
  )
  const { items: bookmarks, refresh: refreshBookmarks } = useCollectionData((r) =>
    r.bookmarks.list(),
  )

  const [noteContent, setNoteContent] = useState('')
  const [noteSaved, setNoteSaved] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizResult, setQuizResult] = useState<{ scorePercent: number; perfect: boolean } | null>(
    null,
  )
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!lesson) return
    void repos.notes.get(lesson.id).then((note) => setNoteContent(note?.content ?? ''))
    setShowQuiz(false)
    setQuizResult(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id])

  if (!lesson || !subject) {
    return <EmptyState title="Lesson not found" action={<Link to="/learn">Back to roadmap</Link>} />
  }

  const isCompleted = activities.some((a) => a.type === 'lesson-completed' && a.refId === lesson.id)
  const isBookmarked = bookmarks.some((b) => b.targetType === 'lesson' && b.targetId === lesson.id)

  function handleNoteChange(value: string) {
    setNoteContent(value)
    setNoteSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void repos.notes
        .upsert({
          id: lesson!.id,
          userId: uid,
          lessonId: lesson!.id,
          content: value,
          updatedAt: new Date().toISOString(),
        })
        .then(() => setNoteSaved(true))
    }, 600)
  }

  async function toggleBookmark() {
    if (isBookmarked) {
      await repos.bookmarks.remove(lesson!.id)
    } else {
      await repos.bookmarks.upsert({
        id: lesson!.id,
        userId: uid,
        targetType: 'lesson',
        targetId: lesson!.id,
        createdAt: new Date().toISOString(),
      })
    }
    void refreshBookmarks()
  }

  async function markComplete() {
    await actions.completeLesson(lesson!.id, lesson!.title, subject!.id)
    void refreshActivities()
  }

  const questions: Question[] = quiz
    ? quiz.questionIds.map((id) => QUESTIONS_BY_ID[id]).filter((q): q is Question => Boolean(q))
    : []

  async function handleQuizComplete(results: QuestionResult[]) {
    const correctCount = results.filter((r) => r.correct).length
    const scorePercent = Math.round((correctCount / results.length) * 100)
    const perfect = correctCount === results.length
    const attempt = {
      id: crypto.randomUUID(),
      quizId: quiz!.id,
      userId: uid,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      scorePercent,
      perfect,
      durationSeconds: 0,
      results,
    }
    await actions.submitQuizAttempt(attempt, quiz!.title, subject!.id)
    setQuizResult({ scorePercent, perfect })
    void refreshActivities()
  }

  return (
    <div className={styles.page}>
      <div>
        <div className={styles.breadcrumb}>
          <Link to={`/learn/${subject.id}`}>{subject.title}</Link>
        </div>
        <div className={styles.title}>{lesson.title}</div>
        <div className={styles.summary}>{lesson.summary}</div>
        <div className={styles.metaRow}>
          <Badge>{lesson.difficulty}</Badge>
          <Badge tone="neutral">{lesson.estimatedMinutes} min</Badge>
          {isCompleted ? <Badge tone="success">Completed</Badge> : null}
        </div>
      </div>

      <div className={styles.blocks}>
        {lesson.blocks.map((block) => (
          <LessonBlockRenderer key={block.id} block={block} />
        ))}
      </div>

      <div className={styles.actionsRow}>
        {!isCompleted ? (
          <Button variant="primary" onClick={() => void markComplete()}>
            <CheckIcon size={14} /> Mark lesson complete
          </Button>
        ) : null}
        <Button variant="secondary" onClick={() => void toggleBookmark()}>
          {isBookmarked ? 'Saved' : 'Save for later'}
        </Button>
        {quiz && !showQuiz && !quizResult ? (
          <Button variant="secondary" onClick={() => setShowQuiz(true)}>
            Take the quiz
          </Button>
        ) : null}
      </div>

      {quiz && showQuiz && !quizResult ? (
        <Card>
          <QuizRunner
            quiz={quiz}
            questions={questions}
            onComplete={(results) => void handleQuizComplete(results)}
          />
        </Card>
      ) : null}

      {quizResult ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{quizResult.scorePercent}%</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 8 }}>
              {quizResult.perfect
                ? 'Perfect score!'
                : `Passing score is ${quiz!.passScorePercent}%.`}
            </p>
          </div>
        </Card>
      ) : null}

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Your notes</div>
        <textarea
          className={styles.notesTextarea}
          value={noteContent}
          onChange={(event) => handleNoteChange(event.target.value)}
          placeholder="Jot down anything worth remembering — autosaves as you type."
        />
        <div className={styles.notesStatus}>{noteSaved ? 'Saved' : 'Saving...'}</div>
      </Card>

      {lesson.relatedLessonIds && lesson.relatedLessonIds.length > 0 ? (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Related lessons</div>
          <div className={styles.relatedList}>
            {lesson.relatedLessonIds.map((relatedId) => {
              const related = LESSONS_BY_ID[relatedId]
              if (!related) return null
              return (
                <Link
                  key={relatedId}
                  to={`/learn/${related.subjectId}/${related.id}`}
                  className={styles.relatedLink}
                >
                  {related.title}
                </Link>
              )
            })}
          </div>
        </Card>
      ) : null}

      <Button variant="ghost" onClick={() => navigate(`/learn/${subject.id}`)}>
        Back to {subject.shortTitle}
      </Button>
    </div>
  )
}
