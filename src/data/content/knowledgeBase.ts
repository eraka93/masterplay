import type { KnowledgeItem } from '@/models'

export const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'kb-jsi-vs-bridge',
    title: 'JSI vs. the Bridge, in one paragraph',
    summary: 'The one-paragraph version to have ready in a conversation or interview.',
    content:
      'The classic Bridge moves data between JS and native by serializing everything to JSON, queuing ' +
      "it, and processing it asynchronously in batches — because the two sides don't share memory. JSI " +
      'gives native code a direct C++ reference into the running JS runtime, so calls can be synchronous ' +
      'and nothing needs to be serialized. Fabric (rendering) and TurboModules (native modules) are both ' +
      'built on top of JSI, not the other way around.',
    codeExamples: [],
    externalLinks: [
      {
        label: 'React Native Architecture Overview',
        href: 'https://reactnative.dev/architecture/overview',
      },
    ],
    relatedLessonIds: ['lesson-jsi', 'lesson-rn-bridge'],
    relatedProblemIds: [],
    tags: ['react-native', 'architecture'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-flatlist-perf-checklist',
    title: 'FlatList performance checklist',
    summary: 'The things to check, in order, before assuming a list needs FlashList.',
    content:
      '1. Are rows memoized, and are all their props stable across renders (no inline functions/objects)?\n' +
      '2. Is getItemLayout set when row height is fixed/known?\n' +
      '3. Is windowSize tuned down from the default for this specific list?\n' +
      '4. Is removeClippedSubviews enabled, especially on Android?\n' +
      '5. Are images pre-sized and cached, not decoded/resized per row per frame?\n\n' +
      'Only after all five are true and it is still janky does the list structurally need recycling ' +
      '(FlashList) rather than tuning.',
    codeExamples: [
      {
        language: 'jsx',
        code: 'const Row = React.memo(RowImpl, (prev, next) => prev.item.id === next.item.id)',
        caption: 'Stable memoized row comparator',
      },
    ],
    externalLinks: [],
    relatedLessonIds: ['lesson-rn-performance'],
    relatedProblemIds: ['problem-flatlist-frame-drops'],
    tags: ['react-native', 'performance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-event-loop-cheatsheet',
    title: 'Event loop cheat sheet',
    summary: 'Sync > microtasks > one macrotask > repeat.',
    content:
      'Every tick: run all synchronous code to completion, then drain the ENTIRE microtask queue ' +
      '(including microtasks queued by other microtasks), then take exactly one item off the macrotask ' +
      'queue and repeat. Promises and queueMicrotask are microtasks; setTimeout, setInterval, and I/O ' +
      'callbacks are macrotasks.',
    codeExamples: [],
    externalLinks: [],
    relatedLessonIds: ['lesson-js-event-loop'],
    relatedProblemIds: [],
    tags: ['javascript'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-context-rerender-fanout',
    title: 'Why one Context change re-renders everything',
    summary: 'Context compares by reference, not by field.',
    content:
      'React Context re-renders every consumer whenever the provided value changes by reference — it ' +
      'does not diff individual fields. A `{ user, theme }` value that only ever changes `theme` still ' +
      're-renders every consumer of `user` too. Fixes: split into separate contexts per concern, or ' +
      'memoize the value object and only replace the reference when something meaningful changed.',
    codeExamples: [],
    externalLinks: [],
    relatedLessonIds: ['lesson-react-reconciliation'],
    relatedProblemIds: [],
    tags: ['architecture', 'performance', 'state-management'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const KNOWLEDGE_ITEMS_BY_ID: Record<string, KnowledgeItem> = Object.fromEntries(
  KNOWLEDGE_ITEMS.map((item) => [item.id, item]),
)
