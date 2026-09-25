import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  percent: number
  thin?: boolean
  label?: string
}

export function ProgressBar({ percent, thin = false, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div
      className={[styles.track, thin ? styles.thin : ''].filter(Boolean).join(' ')}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={styles.fill} style={{ width: `${clamped}%` }} />
    </div>
  )
}
