import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import styles from './Card.module.css'

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  interactive?: boolean
  padding?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

/** Use cardClassName() directly when the card needs to render as a non-div element (e.g. a Link). */
export function cardClassName({
  interactive = false,
  padding = 'md',
  className,
}: {
  interactive?: boolean
  padding?: 'sm' | 'md' | 'lg'
  className?: string
} = {}): string {
  return [
    styles.card,
    interactive ? styles.interactive : '',
    padding === 'sm' ? styles['padded-sm'] : '',
    padding === 'lg' ? styles['padded-lg'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function Card({
  interactive = false,
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div className={cardClassName({ interactive, padding, className })} {...rest}>
      {children}
    </div>
  )
}
