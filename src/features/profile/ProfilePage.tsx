import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatTile, StatTileRow } from '@/components/ui/StatTile'
import { LEARNING_PATHS_BY_ID } from '@/config/learningPaths'
import { getLevelProgress } from '@/config/levels'
import { SUBJECTS_BY_ID } from '@/config/subjects'
import { StudyRemindersCard } from '@/features/notifications/StudyRemindersCard'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { formatMinutes } from '@/utils/date'

import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { profile, loading } = useUserProfile()
  const { isFirebaseConfigured, signOutUser, user } = useAuth()

  if (loading || !profile) return <PageSpinner />

  const levelProgress = getLevelProgress(profile.totalXp)
  const path = profile.currentLearningPathId
    ? LEARNING_PATHS_BY_ID[profile.currentLearningPathId]
    : null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.avatar}>{profile.displayName.charAt(0).toUpperCase()}</span>
        <div>
          <div className={styles.name}>{profile.displayName}</div>
          <div className={styles.levelLine}>
            Level {levelProgress.level.id} — {levelProgress.level.title}
          </div>
        </div>
      </div>

      <Card>
        <ProgressBar percent={levelProgress.progressPercent} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: 12,
            color: 'var(--text-tertiary)',
          }}
        >
          <span>{profile.totalXp} total XP</span>
          <span>{levelProgress.next ? `${levelProgress.next.title} next` : 'Max level'}</span>
        </div>
      </Card>

      <Card>
        <StatTileRow>
          <StatTile
            label="Streak"
            value={`${profile.currentStreakDays}d`}
            sub={`Longest ${profile.longestStreakDays}d`}
          />
          <StatTile label="Lessons" value={profile.lessonsCompleted} />
          <StatTile
            label="Quizzes"
            value={profile.quizzesCompleted}
            sub={`Avg ${profile.averageQuizScorePercent}%`}
          />
          <StatTile label="Challenges" value={profile.challengesCompleted} />
        </StatTileRow>
      </Card>

      <Card>
        <StatTileRow>
          <StatTile label="Study time (total)" value={formatMinutes(profile.totalStudyMinutes)} />
          <StatTile label="This week" value={formatMinutes(profile.weeklyStudyMinutes)} />
          <StatTile label="This month" value={formatMinutes(profile.monthlyStudyMinutes)} />
          <StatTile
            label="Real-world logs"
            value={profile.realWorldProblemsLogged + profile.engineeringDecisionsLogged}
          />
        </StatTileRow>
      </Card>

      {path ? (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            Current learning path
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{path.title}</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {path.description}
          </p>
        </Card>
      ) : null}

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Strongest subjects</div>
        <div className={styles.chipList}>
          {profile.strongestSubjectIds.map((id) => (
            <Badge key={id} tone="success">
              {SUBJECTS_BY_ID[id]?.shortTitle ?? id}
            </Badge>
          ))}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, margin: '16px 0 10px' }}>Weakest subjects</div>
        <div className={styles.chipList}>
          {profile.weakestSubjectIds.map((id) => (
            <Badge key={id} tone="warning">
              {SUBJECTS_BY_ID[id]?.shortTitle ?? id}
            </Badge>
          ))}
        </div>
      </Card>

      <StudyRemindersCard />

      {isFirebaseConfigured ? (
        <Card>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 10 }}>
            Signed in as {user?.email}
          </div>
          <Button variant="secondary" onClick={() => void signOutUser()}>
            Sign out
          </Button>
        </Card>
      ) : null}
    </div>
  )
}
