import type { Lesson } from '@/models'

export const hermesLesson: Lesson = {
  id: 'lesson-hermes',
  moduleId: 'module-new-architecture-core',
  subjectId: 'hermes',
  order: 1,
  title: 'Hermes: The React Native JS Engine',
  summary:
    'Why React Native ships its own JS engine, and what ahead-of-time compilation actually buys ' +
    'you on a mobile device.',
  difficulty: 'intermediate',
  estimatedMinutes: 20,
  tags: ['hermes', 'performance', 'react-native'],
  relatedLessonIds: ['lesson-jsi'],
  blocks: [
    { id: 'b1', type: 'heading', level: 2, text: 'What Hermes is' },
    {
      id: 'b2',
      type: 'text',
      markdown:
        "Hermes is an open-source JS engine built by Meta specifically for React Native's constraints: " +
        'limited memory, limited CPU, and a hard requirement to start fast on a cold app launch. It is ' +
        "React Native's default engine on both platforms, and it implements the JSI `Runtime` interface " +
        '(see the JSI lesson) — it is one possible engine behind that interface, not a required part of it.',
    },
    { id: 'b3', type: 'heading', level: 2, text: 'Ahead-of-time bytecode compilation' },
    {
      id: 'b4',
      type: 'text',
      markdown:
        'Most JS engines (V8, JavaScriptCore) parse and compile your source JS to bytecode **on the ' +
        "device, at app startup**, then JIT-compile hot paths further. Hermes instead compiles your app's " +
        'JS to bytecode **at build time**, and ships that bytecode in the app bundle. At runtime, Hermes ' +
        'just loads and executes bytecode directly — no parse, no on-device compile step. This is the ' +
        'single biggest reason Hermes improves cold-start time.',
    },
    {
      id: 'b5',
      type: 'diagram',
      title: 'Where the compile step happens',
      nodes: [
        'JS source (build time)',
        'Hermes compiler',
        'Bytecode bundled into the app',
        'Device: load + execute bytecode directly',
      ],
    },
    { id: 'b6', type: 'heading', level: 2, text: 'Memory and garbage collection' },
    {
      id: 'b7',
      type: 'text',
      markdown:
        "Hermes' garbage collector is tuned for mobile: smaller heap overhead and pause characteristics " +
        'suited to memory-constrained devices, rather than the throughput-optimized GCs typical of ' +
        'desktop/server engines. This matters more on low-end Android devices than on a modern iPhone — ' +
        "which is exactly the gap Hermes was built to close, since it's where RN apps historically felt worst.",
    },
    {
      id: 'b8',
      type: 'tip',
      text:
        'No JIT means Hermes typically has *lower* peak throughput for CPU-heavy JS loops than a JIT-ed ' +
        'engine — the tradeoff is deliberate: faster, more predictable startup in exchange for less raw ' +
        'steady-state speed. For a typical app UI this tradeoff is almost always the right one.',
    },
    {
      id: 'b9',
      type: 'warning',
      text:
        'Hermes has historically lagged behind the latest ECMAScript features and had some JS spec ' +
        'edge cases differ from V8/JSC — always check Hermes compatibility before relying on a very new ' +
        'language feature or an Intl API in a React Native app.',
    },
  ],
}
