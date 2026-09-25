import type { ReactNode } from 'react'

interface ProgressRingProps {
  percent: number
  size?: number
  strokeWidth?: number
  trackColor?: string
  fillColor?: string
  children?: ReactNode
}

export function ProgressRing({
  percent,
  size = 96,
  strokeWidth = 8,
  trackColor = 'var(--border-default)',
  fillColor = 'var(--accent-primary)',
  children,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="presentation">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.2,0,0,1)' }}
        />
      </svg>
      {children ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
