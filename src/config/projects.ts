import type { Project } from '@/models'

export const PROJECTS: Project[] = [
  { id: 'mozzart-sport', name: 'Mozzart Sport' },
  { id: 'ontruckloadboard', name: 'OnTruckLoadBoard' },
  { id: 'underdogz', name: 'Underdogz' },
  { id: 'fndservice', name: 'FNDService' },
  { id: 'eteam', name: 'eTeam' },
  { id: 'personal', name: 'Personal' },
]

export const PROJECTS_BY_ID: Record<string, Project> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p]),
)
