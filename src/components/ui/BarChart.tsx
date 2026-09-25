interface BarChartProps {
  data: { label: string; value: number }[]
  height?: number
  color?: string
}

/** A minimal dependency-free bar chart — enough for the app's weekly/monthly XP views. */
export function BarChart({ data, height = 120, color = 'var(--accent-primary)' }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            height: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <div
            title={`${d.label}: ${d.value}`}
            style={{
              width: '100%',
              maxWidth: 28,
              height: `${Math.max(2, (d.value / max) * (height - 24))}px`,
              background: color,
              borderRadius: 4,
            }}
          />
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}
