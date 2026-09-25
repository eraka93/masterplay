import { Link, useParams } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { CheckIcon } from '@/components/ui/icons'
import { EmptyState } from '@/components/ui/EmptyState'
import { Glyph } from '@/components/ui/Glyph'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageSpinner } from '@/components/ui/Spinner'
import { getModulesForSubject } from '@/data/content/modules'
import { LESSONS_BY_ID } from '@/data/content/lessons'
import { SUBJECTS_BY_ID } from '@/config/subjects'
import { useCollectionData } from '@/hooks/useCollectionData'
import { computeSubjectProgress } from '@/services/skillService'

import styles from './SubjectDetailPage.module.css'

export function SubjectDetailPage() {
  const { subjectId = '' } = useParams<{ subjectId: string }>()
  const subject = SUBJECTS_BY_ID[subjectId]
  const { items: activities, loading } = useCollectionData((repos) => repos.activities.list())
  const { items: quizAttempts } = useCollectionData((repos) => repos.quizAttempts.list())

  if (loading) return <PageSpinner />
  if (!subject) return <EmptyState title="Subject not found" />

  const completedLessonIds = new Set(
    activities.filter((a) => a.type === 'lesson-completed' && a.refId).map((a) => a.refId!),
  )
  const progress = computeSubjectProgress(subject.id, completedLessonIds, quizAttempts)
  const modules = getModulesForSubject(subject.id)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Glyph label={subject.icon} seed={subject.id} size={48} />
        <div>
          <div className={styles.title}>{subject.title}</div>
          <div className={styles.description}>{subject.description}</div>
        </div>
      </div>

      <Card>
        <ProgressBar percent={progress.masteryPercent} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: 12,
            color: 'var(--text-tertiary)',
          }}
        >
          <span>{progress.masteryPercent}% mastery</span>
          <span>
            {progress.lessonsCompleted}/{progress.lessonsTotal} lessons
            {progress.quizAverageScorePercent !== null
              ? ` · avg quiz ${progress.quizAverageScorePercent}%`
              : ''}
          </span>
        </div>
      </Card>

      {modules.length === 0 ? (
        <EmptyState
          title="Content coming soon"
          description="This subject is on the roadmap but lessons haven't been authored yet."
        />
      ) : (
        modules.map((module) => (
          <Card key={module.id} className={styles.moduleBlock}>
            <div className={styles.moduleTitle}>{module.title}</div>
            <div className={styles.moduleDescription}>{module.description}</div>
            {module.lessonIds.map((lessonId) => {
              const lesson = LESSONS_BY_ID[lessonId]
              if (!lesson) return null
              const done = completedLessonIds.has(lesson.id)
              return (
                <Link
                  key={lesson.id}
                  to={`/learn/${subject.id}/${lesson.id}`}
                  className={styles.lessonRow}
                >
                  <div className={styles.lessonMeta}>
                    <span className={styles.lessonTitle}>{lesson.title}</span>
                    <span className={styles.lessonSub}>
                      {lesson.estimatedMinutes} min · {lesson.difficulty}
                    </span>
                  </div>
                  {done ? (
                    <span className={styles.checkDone}>
                      <CheckIcon size={12} />
                    </span>
                  ) : (
                    <span className={styles.checkTodo} />
                  )}
                </Link>
              )
            })}
          </Card>
        ))
      )}
    </div>
  )
}
