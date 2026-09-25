import { Link } from 'react-router-dom'

import { ContributionGraph } from '@/components/ContributionGraph'
import { Badge } from '@/components/ui/Badge'
import { Card, cardClassName } from '@/components/ui/Card'
import { ChevronRightIcon } from '@/components/ui/icons'
import { PageSpinner } from '@/components/ui/Spinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatTile, StatTileRow } from '@/components/ui/StatTile'
import { SUBJECTS_BY_ID } from '@/config/subjects'
import { DEFAULT_XP_TARGETS } from '@/config/targets'
import { getLevelProgress } from '@/config/levels'
import { useCollectionData } from '@/hooks/useCollectionData'
import { useUserProfile } from '@/hooks/useUserProfile'
import { getContinueLearningTarget } from '@/services/learningPathService'
import {
  contributionGraphData,
  xpThisMonth,
  xpThisWeek,
  xpToday,
} from '@/services/analyticsService'
import { formatRelativeDate } from '@/utils/date'

import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { profile, loading: profileLoading } = useUserProfile()
  const { items: activities, loading: activitiesLoading } = useCollectionData((repos) =>
    repos.activities.list(),
  )
  const { items: goals } = useCollectionData((repos) => repos.goals.list())
  const { items: reviewSchedule } = useCollectionData((repos) => repos.reviewSchedule.list())

  if (profileLoading || activitiesLoading || !profile) return <PageSpinner />

  const levelProgress = getLevelProgress(profile.totalXp)
  const completedLessonIds = new Set(
    activities
      .filter((activity) => activity.type === 'lesson-completed' && activity.refId)
      .map((activity) => activity.refId!),
  )
  const continueTarget = getContinueLearningTarget(
    profile.currentLearningPathId,
    completedLessonIds,
  )
  const todayXp = xpToday(activities)
  const weekXp = xpThisWeek(activities)
  const monthXp = xpThisMonth(activities)
  const graphDays = contributionGraphData(activities)

  const recentActivities = [...activities]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 8)
  const today = new Date().toISOString().slice(0, 10)
  const dueReviews = reviewSchedule
    .filter((entry) => entry.nextReviewDate <= today)
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
    .slice(0, 5)
  const activeGoals = goals
    .filter((goal) => goal.status === 'active')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>Welcome back, {profile.displayName}</div>
          <div className={styles.greetingSub}>
            {profile.currentStreakDays > 0
              ? `${profile.currentStreakDays}-day streak — keep it going today.`
              : 'Start a streak today with one lesson or quiz.'}
          </div>
        </div>
        <Card padding="sm" className={styles.levelCard}>
          <ProgressRing percent={levelProgress.progressPercent} size={52} strokeWidth={5}>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{levelProgress.level.id}</span>
          </ProgressRing>
          <div className={styles.levelInfo}>
            <span className={styles.levelTitle}>{levelProgress.level.title}</span>
            <span className={styles.levelSub}>
              {levelProgress.next
                ? `${levelProgress.xpForNextLevel! - levelProgress.xpIntoLevel} XP to ${levelProgress.next.title}`
                : 'Max level reached'}
            </span>
          </div>
        </Card>
      </div>

      <Card>
        <StatTileRow>
          <StatTile
            label="Today"
            value={`${todayXp} XP`}
            sub={`Target ${DEFAULT_XP_TARGETS.daily} XP`}
          />
          <StatTile
            label="This week"
            value={`${weekXp} XP`}
            sub={`Target ${DEFAULT_XP_TARGETS.weekly} XP`}
          />
          <StatTile
            label="This month"
            value={`${monthXp} XP`}
            sub={`Target ${DEFAULT_XP_TARGETS.monthly} XP`}
          />
          <StatTile
            label="Total XP"
            value={profile.totalXp}
            sub={`Longest streak ${profile.longestStreakDays}d`}
          />
        </StatTileRow>
        <div style={{ height: 16 }} />
        <div className={styles.targetRow}>
          <div className={styles.targetLabel}>
            <span>Daily target</span>
            <span>
              {todayXp}/{DEFAULT_XP_TARGETS.daily} XP
            </span>
          </div>
          <ProgressBar
            percent={(todayXp / DEFAULT_XP_TARGETS.daily) * 100}
            thin
            label="Daily XP target"
          />
        </div>
      </Card>

      {continueTarget ? (
        <Link
          to={`/learn/${continueTarget.subject.id}/${continueTarget.lesson.id}`}
          className={cardClassName({ interactive: true, className: styles.continueCard })}
        >
          <div className={styles.continueMeta}>
            <span className={styles.continueSubject}>
              Continue learning — {continueTarget.subject.title}
            </span>
            <span className={styles.continueTitle}>{continueTarget.lesson.title}</span>
          </div>
          <span className={styles.continueCta}>
            Continue <ChevronRightIcon size={14} />
          </span>
        </Link>
      ) : null}

      <Card>
        <div className={styles.sectionTitle}>Activity — last year</div>
        <ContributionGraph days={graphDays} />
      </Card>

      <div className={styles.grid2}>
        <div className={styles.stack}>
          <Card>
            <div className={styles.sectionTitle}>Recent activity</div>
            {recentActivities.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                Nothing logged yet today.
              </p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <span className={styles.activityLabel}>{activity.label}</span>
                  <span className={styles.activityMeta}>
                    <Badge tone="accent">+{activity.xpEarned} XP</Badge>
                    {formatRelativeDate(activity.date)}
                  </span>
                </div>
              ))
            )}
          </Card>

          <Card>
            <div className={styles.sectionTitle}>Upcoming goals</div>
            {activeGoals.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                No active goals right now.
              </p>
            ) : (
              activeGoals.map((goal) => (
                <div key={goal.id} className={styles.goalRow}>
                  <div className={styles.goalTitleRow}>
                    <span>{goal.title}</span>
                    <span>
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                  <ProgressBar percent={(goal.progress / goal.target) * 100} thin />
                </div>
              ))
            )}
          </Card>
        </div>

        <div className={styles.stack}>
          <Card>
            <div className={styles.sectionTitle}>Weak areas</div>
            <div className={styles.chipList}>
              {profile.weakestSubjectIds.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Not enough data yet.</p>
              ) : (
                profile.weakestSubjectIds.map((subjectId) => {
                  const subject = SUBJECTS_BY_ID[subjectId]
                  if (!subject) return null
                  return (
                    <Link key={subjectId} to={`/learn/${subjectId}`}>
                      <Badge tone="warning">{subject.shortTitle}</Badge>
                    </Link>
                  )
                })
              )}
            </div>
          </Card>

          <Card>
            <div className={styles.sectionTitle}>Recommended revision</div>
            {dueReviews.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                Complete quizzes to build your revision queue.
              </p>
            ) : (
              dueReviews.map((entry) => (
                <div key={entry.id} className={styles.activityItem}>
                  <span className={styles.activityLabel}>{entry.topic}</span>
                  <span className={styles.activityMeta}>
                    {SUBJECTS_BY_ID[entry.subjectId]?.shortTitle}
                  </span>
                </div>
              ))
            )}
          </Card>

          <Card>
            <div className={styles.sectionTitle}>Learning stats</div>
            <StatTileRow>
              <StatTile label="Lessons" value={profile.lessonsCompleted} />
              <StatTile label="Quizzes" value={profile.quizzesCompleted} />
              <StatTile label="Avg score" value={`${profile.averageQuizScorePercent}%`} />
              <StatTile label="Challenges" value={profile.challengesCompleted} />
            </StatTileRow>
          </Card>
        </div>
      </div>
    </div>
  )
}
