/** Projects the user has worked on — used to attribute real-world problems and decisions. */
export type ProjectId =
  'mozzart-sport' | 'ontruckloadboard' | 'underdogz' | 'fndservice' | 'eteam' | 'personal'

export interface Project {
  id: ProjectId
  name: string
}

export type ProblemDifficulty = 'easy' | 'medium' | 'hard' | 'brutal'

export interface RealWorldProblem {
  id: string
  title: string
  projectId: ProjectId
  technologies: string[]
  date: string
  problemDescription: string
  symptoms: string
  errorMessages?: string
  screenshotUrls?: string[]
  logs?: string
  initialHypothesis: string
  possibleCauses: string[]
  investigation: string
  finalCause: string
  solution: string
  codeBefore?: string
  codeAfter?: string
  whatILearned: string
  tags: string[]
  difficulty: ProblemDifficulty
  timeSpentMinutes: number
  wouldSolveFasterToday: boolean
  createdAt: string
}

export interface DecisionOption {
  id: string
  name: string
  advantages: string[]
  disadvantages: string[]
}

export interface EngineeringDecision {
  id: string
  title: string
  projectId: ProjectId
  date: string
  problem: string
  context: string
  options: DecisionOption[]
  chosenOptionId: string
  reason: string
  tradeoffs: string
  outcome: string
  wouldChooseSameAgain: boolean | null
  tags: string[]
  createdAt: string
}
