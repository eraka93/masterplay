import type { ComponentPropsWithoutRef } from 'react'

import styles from './Badge.module.css'

interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  const classNames = [styles.badge, styles[tone], className].filter(Boolean).join(' ')
  return <span className={classNames} {...rest} />
}
