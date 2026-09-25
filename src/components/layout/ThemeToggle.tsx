import { MoonIcon, SunIcon } from '@/components/ui/icons'
import { useTheme } from '@/hooks/useTheme'

import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
