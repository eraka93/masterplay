import type { SubjectSlug } from './content'

export type QuestionType = 'single-choice' | 'multiple-choice' | 'true-false' | 'code' | 'scenario'

interface QuestionBase {
  id: string
  type: QuestionType
  prompt: string
  explanation: string
  topic: string
}

export interface ChoiceOption {
  id: string
  text: string
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single-choice'
  options: ChoiceOption[]
  correctOptionId: string
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice'
  options: ChoiceOption[]
  correctOptionIds: string[]
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true-false'
  correctAnswer: boolean
}

export interface CodeQuestion extends QuestionBase {
  type: 'code'
  code: string
  language: string
  options: ChoiceOption[]
  correctOptionId: string
}

export interface ScenarioQuestion extends QuestionBase {
  type: 'scenario'
  scenario: string
  options: ChoiceOption[]
  correctOptionId: string
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | CodeQuestion
  | ScenarioQuestion

export interface Quiz {
  id: string
  lessonId: string
  subjectId: SubjectSlug
  title: string
  questionIds: string[]
  passScorePercent: number
}

export interface QuestionResult {
  questionId: string
  topic: string
  correct: boolean
  /** Selected option id(s), or 'true'/'false' for true-false questions. */
  response: string[]
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  startedAt: string
  completedAt: string
  scorePercent: number
  perfect: boolean
  durationSeconds: number
  results: QuestionResult[]
}
