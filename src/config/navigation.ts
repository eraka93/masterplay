export interface NavItem {
  to: string
  label: string
  /** Matches the `icon` glyph convention used across the app: a short 2-3 letter monogram. */
  icon: string
  /** Shown in bottom nav (mobile) and sidebar (desktop). Set false to hide from bottom nav. */
  primary: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: 'HM', primary: true },
  { to: '/learn', label: 'Learn', icon: 'LN', primary: true },
  { to: '/practice', label: 'Practice', icon: 'PR', primary: true },
  { to: '/knowledge', label: 'Knowledge', icon: 'KB', primary: true },
  { to: '/profile', label: 'Profile', icon: 'PF', primary: true },
]

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { to: '/problems', label: 'Real World Problems', icon: 'RW', primary: false },
  { to: '/decisions', label: 'Engineering Decisions', icon: 'ED', primary: false },
  { to: '/analytics', label: 'Analytics', icon: 'AN', primary: false },
  { to: '/goals', label: 'Goals', icon: 'GL', primary: false },
  { to: '/achievements', label: 'Achievements', icon: 'AC', primary: false },
  { to: '/saved', label: 'Saved', icon: 'SV', primary: false },
]
