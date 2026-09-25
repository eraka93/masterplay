import type { Quiz } from '@/models'

export const QUIZZES: Quiz[] = [
  {
    id: 'quiz-js-event-loop',
    lessonId: 'lesson-js-event-loop',
    subjectId: 'javascript-deep-dive',
    title: 'The Event Loop',
    questionIds: ['q-event-loop-1', 'q-event-loop-2', 'q-event-loop-3'],
    passScorePercent: 70,
  },
  {
    id: 'quiz-react-reconciliation',
    lessonId: 'lesson-react-reconciliation',
    subjectId: 'react-internals',
    title: 'React Reconciliation',
    questionIds: ['q-reconciliation-1', 'q-reconciliation-2', 'q-reconciliation-3'],
    passScorePercent: 70,
  },
  {
    id: 'quiz-react-native-runtime-rendering',
    lessonId: 'lesson-react-native-runtime-rendering',
    subjectId: 'react-native-fundamentals',
    title: 'React Native Runtime and Rendering',
    questionIds: [
      'q-react-native-runtime-1',
      'q-react-native-runtime-2',
      'q-react-native-runtime-3',
      'q-react-native-runtime-4',
      'q-react-native-runtime-5',
      'q-react-native-runtime-6',
    ],
    passScorePercent: 75,
  },
  {
    id: 'quiz-jsi',
    lessonId: 'lesson-jsi',
    subjectId: 'jsi',
    title: 'JSI in React Native',
    questionIds: ['q-jsi-1', 'q-jsi-2', 'q-jsi-3', 'q-jsi-4', 'q-jsi-5', 'q-jsi-6'],
    passScorePercent: 75,
  },
  {
    id: 'quiz-rn-performance',
    lessonId: 'lesson-rn-performance',
    subjectId: 'react-native-performance',
    title: 'React Native Performance',
    questionIds: ['q-perf-1', 'q-perf-2', 'q-perf-3'],
    passScorePercent: 70,
  },
]

export const QUIZZES_BY_ID: Record<string, Quiz> = Object.fromEntries(
  QUIZZES.map((quiz) => [quiz.id, quiz]),
)

export function getQuizForLesson(lessonId: string): Quiz | undefined {
  return QUIZZES.find((quiz) => quiz.lessonId === lessonId)
}
