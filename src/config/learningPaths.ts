import type { LearningPath } from '@/models'

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'senior-mobile-engineer',
    title: 'Senior Mobile Engineer',
    description: 'RN internals, performance, and native fundamentals for a senior-level bar.',
    targetLevelId: 6,
    subjectIds: [
      'javascript-deep-dive',
      'typescript-deep-dive',
      'react-internals',
      'react-native-fundamentals',
      'react-native-advanced',
      'react-native-architecture',
      'react-native-new-architecture',
      'hermes',
      'jsi',
      'fabric',
      'turbomodules',
      'react-native-performance',
      'testing',
    ],
  },
  {
    id: 'staff-mobile-engineer',
    title: 'Staff Mobile Engineer',
    description: 'Depth across the whole new architecture, plus native platforms and CI/CD.',
    targetLevelId: 8,
    subjectIds: [
      'react-native-new-architecture',
      'codegen',
      'android-fundamentals',
      'kotlin-for-rn',
      'ios-fundamentals',
      'swift-for-rn',
      'mobile-security',
      'ci-cd',
      'offline-first',
      'state-management',
    ],
  },
  {
    id: 'mobile-architect',
    title: 'Mobile Architect',
    description: 'System design fluency across mobile, backend, and distributed systems.',
    targetLevelId: 9,
    subjectIds: [
      'backend-fundamentals',
      'nodejs',
      'databases',
      'api-design',
      'websockets',
      'system-design',
      'mobile-system-design',
    ],
  },
]

export const LEARNING_PATHS_BY_ID: Record<string, LearningPath> = Object.fromEntries(
  LEARNING_PATHS.map((path) => [path.id, path]),
)
