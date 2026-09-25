import type { DayActivitySummary } from '@/models'
import { intensityBucket } from '@/services/analyticsService'
import { formatMinutes } from '@/utils/date'

import styles from './ContributionGraph.module.css'

/** GitHub-style ~1-year activity graph (spec section 5). Days pad to a full week at the start. */
export function ContributionGraph({ days }: { days: DayActivitySummary[] }) {
  const firstDay = days[0]
  const leadingPad: null[] = firstDay
    ? Array.from({ length: (new Date(firstDay.date).getDay() + 6) % 7 }, () => null)
    : []
  const cells: (DayActivitySummary | null)[] = [...leadingPad, ...days]

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {cells.map((day, index) =>
          day ? (
            <div
              key={day.date}
              className={`${styles.cell} ${styles[`level${intensityBucket(day.xp)}`]}`}
              title={`${day.date}: ${day.xp} XP${day.minutesStudied ? ` · ${formatMinutes(day.minutesStudied)}` : ''}`}
            />
          ) : (
            <div key={`pad-${index}`} className={styles.cell} style={{ visibility: 'hidden' }} />
          ),
        )}
      </div>
      <div className={styles.legend}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`${styles.cell} ${styles[`level${level}`]}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
