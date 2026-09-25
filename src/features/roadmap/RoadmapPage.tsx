import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { cardClassName } from '@/components/ui/Card'
import { Glyph } from '@/components/ui/Glyph'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageSpinner } from '@/components/ui/Spinner'
import { SUBJECT_TRACKS, SUBJECTS } from '@/config/subjects'
import { useCollectionData } from '@/hooks/useCollectionData'
import { computeSubjectProgress } from '@/services/skillService'

import styles from './RoadmapPage.module.css'

export function RoadmapPage() {
  const { items: activities, loading: activitiesLoading } = useCollectionData((repos) =>
    repos.activities.list(),
  )
  const { items: quizAttempts, loading: quizLoading } = useCollectionData((repos) =>
    repos.quizAttempts.list(),
  )

  if (activitiesLoading || quizLoading) return <PageSpinner />

  const completedLessonIds = new Set(
    activities.filter((a) => a.type === 'lesson-completed' && a.refId).map((a) => a.refId!),
  )

  return (
    <div className={styles.page}>
      {SUBJECT_TRACKS.map((track) => (
        <section key={track.id}>
          <div className={styles.trackTitle}>{track.label}</div>
          <div className={styles.grid}>
            {SUBJECTS.filter((subject) => subject.track === track.id).map((subject) => {
              const progress = computeSubjectProgress(subject.id, completedLessonIds, quizAttempts)
              return (
                <Link
                  key={subject.id}
                  to={`/learn/${subject.id}`}
                  className={cardClassName({ interactive: true, className: styles.card })}
                >
                  <div className={styles.cardTop}>
                    <Glyph label={subject.icon} seed={subject.id} />
                    {progress.lessonsTotal === 0 ? (
                      <Badge tone="neutral">Coming soon</Badge>
                    ) : progress.masteryPercent >= 100 ? (
                      <Badge tone="success">Mastered</Badge>
                    ) : progress.lessonsCompleted > 0 ? (
                      <Badge tone="accent">In progress</Badge>
                    ) : null}
                  </div>
                  <div>
                    <div className={styles.cardTitle}>{subject.title}</div>
                    <div className={styles.cardDescription}>{subject.description}</div>
                  </div>
                  <ProgressBar percent={progress.masteryPercent} thin />
                  <div className={styles.cardMeta}>
                    <span>
                      {progress.lessonsCompleted}/{progress.lessonsTotal || '?'} lessons
                    </span>
                    <span>~{subject.estimatedHours}h</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
