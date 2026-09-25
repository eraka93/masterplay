import { BarChart } from '@/components/ui/BarChart'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatTile, StatTileRow } from '@/components/ui/StatTile'
import { SUBJECTS } from '@/config/subjects'
import { useCollectionData } from '@/hooks/useCollectionData'
import { useUserProfile } from '@/hooks/useUserProfile'
import { xpByDate } from '@/services/analyticsService'
import { computeSubjectProgress } from '@/services/skillService'
import { isoDateRangeEndingToday } from '@/utils/date'

import styles from './AnalyticsPage.module.css'

export function AnalyticsPage() {
  const { profile, loading: profileLoading } = useUserProfile()
  const { items: activities, loading: activitiesLoading } = useCollectionData((repos) =>
    repos.activities.list(),
  )
  const { items: quizAttempts, loading: quizLoading } = useCollectionData((repos) =>
    repos.quizAttempts.list(),
  )
  const { items: reviewSchedule } = useCollectionData((repos) => repos.reviewSchedule.list())

  if (profileLoading || activitiesLoading || quizLoading || !profile) return <PageSpinner />

  const byDate = xpByDate(activities)
  const last14 = isoDateRangeEndingToday(14).map((date) => ({
    label: date.slice(5),
    value: byDate.get(date) ?? 0,
  }))

  const completedLessonIds = new Set(
    activities.filter((a) => a.type === 'lesson-completed' && a.refId).map((a) => a.refId!),
  )
  const skillMatrix = SUBJECTS.map((subject) => ({
    subject,
    progress: computeSubjectProgress(subject.id, completedLessonIds, quizAttempts),
  })).filter((entry) => entry.progress.lessonsTotal > 0 || entry.progress.masteryPercent > 0)

  const recentQuizzes = [...quizAttempts]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 8)
  const dueForReview = reviewSchedule.filter(
    (entry) => entry.nextReviewDate <= new Date().toISOString().slice(0, 10),
  )

  return (
    <div className={styles.page}>
      <Card>
        <StatTileRow>
          <StatTile label="Total XP" value={profile.totalXp} />
          <StatTile
            label="Current streak"
            value={`${profile.currentStreakDays}d`}
            sub={`Longest ${profile.longestStreakDays}d`}
          />
          <StatTile label="Avg quiz score" value={`${profile.averageQuizScorePercent}%`} />
          <StatTile
            label="Study time"
            value={`${Math.round(profile.totalStudyMinutes / 60)}h`}
            sub={`${profile.totalStudyMinutes} min total`}
          />
        </StatTileRow>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>XP — last 14 days</div>
        <BarChart data={last14} />
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Skill matrix</div>
        <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginBottom: 12 }}>
          Reflects content completed and quiz performance — not an objective measure of engineering
          ability.
        </p>
        {skillMatrix.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Complete a lesson to see your first data point.
          </p>
        ) : (
          skillMatrix.map(({ subject, progress }) => (
            <div key={subject.id} className={styles.matrixRow}>
              <span className={styles.matrixLabel}>{subject.shortTitle}</span>
              <div style={{ flex: 1 }}>
                <ProgressBar percent={progress.masteryPercent} thin />
              </div>
              <span className={styles.matrixValue}>{progress.masteryPercent}%</span>
            </div>
          ))
        )}
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Recent quiz scores</div>
        {recentQuizzes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No quizzes completed yet.</p>
        ) : (
          <BarChart
            data={recentQuizzes
              .reverse()
              .map((a) => ({ label: `${a.scorePercent}%`, value: a.scorePercent }))}
            color="var(--accent-violet)"
          />
        )}
      </Card>

      <Card>
        <StatTileRow>
          <StatTile label="Lessons completed" value={profile.lessonsCompleted} />
          <StatTile label="Quizzes completed" value={profile.quizzesCompleted} />
          <StatTile label="Challenges completed" value={profile.challengesCompleted} />
          <StatTile label="Due for review" value={dueForReview.length} />
        </StatTileRow>
      </Card>
    </div>
  )
}
