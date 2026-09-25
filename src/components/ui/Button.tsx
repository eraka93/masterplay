import type { ComponentPropsWithoutRef } from 'react'

import styles from './Button.module.css'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button type={type} className={classNames} {...rest} />
}
