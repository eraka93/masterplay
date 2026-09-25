import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { Question, QuestionResult, Quiz } from '@/models'

import styles from './QuizRunner.module.css'

interface QuizRunnerProps {
  quiz: Quiz
  questions: Question[]
  onComplete: (results: QuestionResult[]) => void
}

function isCorrect(question: Question, response: string[]): boolean {
  switch (question.type) {
    case 'single-choice':
    case 'code':
    case 'scenario':
      return response[0] === question.correctOptionId
    case 'multiple-choice': {
      const correct = [...question.correctOptionIds].sort()
      const given = [...response].sort()
      return correct.length === given.length && correct.every((id, i) => id === given[i])
    }
    case 'true-false':
      return response[0] === String(question.correctAnswer)
  }
}

export function QuizRunner({ quiz, questions, onComplete }: QuizRunnerProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<QuestionResult[]>([])

  const question = questions[index]
  if (!question) return null

  const isLast = index === questions.length - 1

  function toggleOption(optionId: string) {
    if (checked) return
    if (question!.type === 'multiple-choice') {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      )
    } else {
      setSelected([optionId])
    }
  }

  function handleCheck() {
    setChecked(true)
  }

  function handleNext() {
    const correct = isCorrect(question!, selected)
    const nextResults = [
      ...results,
      { questionId: question!.id, topic: question!.topic, correct, response: selected },
    ]
    if (isLast) {
      onComplete(nextResults)
      return
    }
    setResults(nextResults)
    setIndex((i) => i + 1)
    setSelected([])
    setChecked(false)
  }

  const options =
    question.type === 'single-choice' ||
    question.type === 'code' ||
    question.type === 'scenario' ||
    question.type === 'multiple-choice'
      ? question.options
      : [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' },
        ]

  const correctIds =
    question.type === 'multiple-choice'
      ? question.correctOptionIds
      : question.type === 'true-false'
        ? [String(question.correctAnswer)]
        : [question.correctOptionId]

  return (
    <div className={styles.wrap}>
      <div className={styles.progress}>
        Question {index + 1} of {questions.length} — {quiz.title}
      </div>

      {'scenario' in question ? (
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{question.scenario}</p>
      ) : null}
      <div className={styles.prompt}>{question.prompt}</div>
      {'code' in question && question.code ? (
        <pre className={styles.codeSample}>
          <code>{question.code}</code>
        </pre>
      ) : null}

      <div className={styles.options}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id)
          const isRight = correctIds.includes(option.id)
          let cls = styles.option
          if (checked && isRight) cls += ` ${styles.optionCorrect}`
          else if (checked && isSelected && !isRight) cls += ` ${styles.optionIncorrect}`
          else if (isSelected) cls += ` ${styles.optionSelected}`
          return (
            <button
              key={option.id}
              className={cls}
              onClick={() => toggleOption(option.id)}
              disabled={checked}
            >
              {option.text}
            </button>
          )
        })}
      </div>

      {checked ? <div className={styles.explanation}>{question.explanation}</div> : null}

      <div className={styles.footer}>
        <span />
        {checked ? (
          <Button variant="primary" onClick={handleNext}>
            {isLast ? 'Finish quiz' : 'Next question'}
          </Button>
        ) : (
          <Button variant="primary" onClick={handleCheck} disabled={selected.length === 0}>
            Check answer
          </Button>
        )}
      </div>
    </div>
  )
}
