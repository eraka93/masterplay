import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('reflects the given percent as an accessible progressbar value', () => {
    render(<ProgressBar percent={42} label="Daily XP target" />)
    const bar = screen.getByRole('progressbar', { name: 'Daily XP target' })
    expect(bar).toHaveAttribute('aria-valuenow', '42')
  })

  it('clamps values above 100', () => {
    render(<ProgressBar percent={150} label="Over target" />)
    expect(screen.getByRole('progressbar', { name: 'Over target' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
  })

  it('clamps negative values to 0', () => {
    render(<ProgressBar percent={-10} label="Negative" />)
    expect(screen.getByRole('progressbar', { name: 'Negative' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
  })
})
