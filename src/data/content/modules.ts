import type { Module } from '@/models'

export const MODULES: Module[] = [
  {
    id: 'module-js-execution-model',
    subjectId: 'javascript-deep-dive',
    order: 1,
    title: 'Execution Model',
    description: 'The call stack, the event loop, and how async code actually gets scheduled.',
    lessonIds: ['lesson-js-event-loop'],
  },
  {
    id: 'module-react-rendering',
    subjectId: 'react-internals',
    order: 1,
    title: 'Rendering & Reconciliation',
    description: 'How React decides what changed, and how Fiber schedules that work.',
    lessonIds: ['lesson-react-reconciliation'],
  },
  {
    id: 'module-react-native-runtime',
    subjectId: 'react-native-fundamentals',
    order: 1,
    title: 'React Native Runtime Fundamentals',
    description:
      'Build the runtime mental model required to reason about React Native rendering, JavaScript execution, native views and performance before moving into Bridge, JSI and the New Architecture.',
    lessonIds: ['lesson-react-native-runtime-rendering'],
  },
  {
    id: 'module-rn-architecture-classic',
    subjectId: 'react-native-architecture',
    order: 1,
    title: 'The Classic Bridge',
    description: 'How the original architecture connected JS and native, and where it strained.',
    lessonIds: ['lesson-rn-bridge'],
  },
  {
    id: 'module-new-architecture-core',
    subjectId: 'jsi',
    order: 1,
    title: 'JSI Core Concepts',
    description: 'Direct JS-to-native calls, HostObjects, HostFunctions, and what is built on top.',
    lessonIds: ['lesson-jsi'],
  },
  {
    id: 'module-hermes-core',
    subjectId: 'hermes',
    order: 1,
    title: 'The Hermes Engine',
    description: 'Ahead-of-time compilation and mobile-tuned garbage collection.',
    lessonIds: ['lesson-hermes'],
  },
  {
    id: 'module-fabric-core',
    subjectId: 'fabric',
    order: 1,
    title: 'The Fabric Renderer',
    description: 'The shared C++ rendering core and the new commit pipeline.',
    lessonIds: ['lesson-fabric'],
  },
  {
    id: 'module-turbomodules-core',
    subjectId: 'turbomodules',
    order: 1,
    title: 'TurboModule Fundamentals',
    description: 'Lazy loading, typed specs, and JSI-backed native methods.',
    lessonIds: ['lesson-turbomodules'],
  },
  {
    id: 'module-rn-performance-fundamentals',
    subjectId: 'react-native-performance',
    order: 1,
    title: 'Performance Fundamentals',
    description: 'Frame budgets, thread bottlenecks, and diagnosing list performance.',
    lessonIds: ['lesson-rn-performance'],
  },
]

export const MODULES_BY_ID: Record<string, Module> = Object.fromEntries(
  MODULES.map((module) => [module.id, module]),
)

export function getModulesForSubject(subjectId: string): Module[] {
  return MODULES.filter((module) => module.subjectId === subjectId).sort(
    (a, b) => a.order - b.order,
  )
}
