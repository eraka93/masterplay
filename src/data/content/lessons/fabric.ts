import type { Lesson } from '@/models'

export const fabricLesson: Lesson = {
  id: 'lesson-fabric',
  moduleId: 'module-new-architecture-core',
  subjectId: 'fabric',
  order: 1,
  title: 'Fabric: The New Rendering System',
  summary:
    "React Native's rendering pipeline under the New Architecture — a shared C++ core and a " +
    'JSI-connected shadow tree.',
  difficulty: 'advanced',
  estimatedMinutes: 25,
  tags: ['fabric', 'react-native', 'architecture', 'performance'],
  relatedLessonIds: ['lesson-jsi', 'lesson-react-reconciliation'],
  blocks: [
    { id: 'b1', type: 'heading', level: 2, text: 'What Fabric replaces' },
    {
      id: 'b2',
      type: 'text',
      markdown:
        'In the classic architecture, the "shadow tree" (the intermediate representation React uses to ' +
        'compute layout before touching real native views) lived on its own thread and communicated with ' +
        'both JS and the native UI thread through the Bridge. Fabric replaces that with a **C++ core** ' +
        'that both JS and native platform code talk to directly through JSI — no serialization step ' +
        'between "React committed a tree" and "native applies it."',
    },
    { id: 'b3', type: 'heading', level: 2, text: 'Shared C++ core, thin platform layers' },
    {
      id: 'b4',
      type: 'text',
      markdown:
        'The shadow tree, layout (Yoga), and diffing logic now live in cross-platform C++, shared between ' +
        'iOS and Android. Each platform keeps a thin native layer that turns committed C++ shadow nodes ' +
        'into real `UIView`s or Android `View`s — the heavy logic is written once, not duplicated per ' +
        'platform.',
    },
    {
      id: 'b5',
      type: 'diagram',
      title: 'Fabric commit pipeline',
      nodes: [
        'React commits a Fiber tree (reconciliation)',
        'Shadow tree built/updated in C++ (via JSI)',
        'Yoga computes layout',
        'Diff against previous shadow tree',
        'Native mounts/updates real views',
      ],
    },
    { id: 'b6', type: 'heading', level: 2, text: 'What this enables' },
    {
      id: 'b7',
      type: 'text',
      markdown:
        '- **Synchronous layout reads**, like measuring a view without waiting a tick for a callback.\n' +
        '- **Consistent prioritization** with React 18 concurrent features — Fabric can align commit timing ' +
        'with React scheduling instead of the two systems drifting out of sync across an async bridge.\n' +
        '- **More predictable event ordering** — a touch event and the render it triggers can be reasoned ' +
        'about as one pipeline instead of two systems racing across an async boundary.',
    },
    {
      id: 'b8',
      type: 'tip',
      text:
        'Fabric is a rendering/commit system, not a replacement for React reconciliation — the diffing ' +
        'algorithm you learned in the React Internals subject still runs exactly the same way on the JS side.',
    },
  ],
}
