import type { Lesson } from '@/models'

export const reactReconciliationLesson: Lesson = {
  id: 'lesson-react-reconciliation',
  moduleId: 'module-react-rendering',
  subjectId: 'react-internals',
  order: 1,
  title: 'React Reconciliation',
  summary:
    'How React decides what actually changed between renders, why keys matter, and what Fiber ' +
    'changed about how that work gets scheduled.',
  difficulty: 'intermediate',
  estimatedMinutes: 30,
  tags: ['react', 'reconciliation', 'fiber'],
  quizId: 'quiz-react-reconciliation',
  blocks: [
    {
      id: 'b1',
      type: 'heading',
      level: 2,
      text: 'Rendering is not the same as committing to the DOM',
    },
    {
      id: 'b2',
      type: 'text',
      markdown:
        'When state changes, React calls your component function again — that produces a new React ' +
        'element tree, not new DOM. **Reconciliation** is the diffing algorithm that compares the new ' +
        'tree to the previous one and computes the minimal set of real changes needed. **Commit** is the ' +
        'separate phase that actually applies those changes to the host environment (the DOM, or in React ' +
        'Native, the shadow tree — see the Fabric lesson).',
    },
    { id: 'b2b', type: 'heading', level: 2, text: 'The diffing heuristics' },
    {
      id: 'b3',
      type: 'text',
      markdown:
        'A fully general tree-diff algorithm is O(n³) — too slow to run on every render. React trades ' +
        'optimality for speed with two assumptions that hold for almost all real UI:\n\n' +
        '1. **Different element types produce different trees.** If a `<div>` becomes a `<span>` at the ' +
        'same position, React tears down the whole subtree and rebuilds it rather than trying to diff ' +
        'inside it.\n' +
        '2. **Keys hint at stable identity across renders**, especially in lists. Without keys, React ' +
        'matches children by index — which is wrong the moment the list is reordered, filtered, or has ' +
        'items inserted in the middle.',
    },
    {
      id: 'b4',
      type: 'code',
      language: 'jsx',
      caption: 'Index-as-key silently breaking component state',
      code: `// Reordering this list with index keys reuses the wrong component instances,
// so any local state (e.g. an uncontrolled input's value) sticks to the position,
// not the item.
items.map((item, index) => <Row key={index} item={item} />)

// Correct: key by stable identity.
items.map((item) => <Row key={item.id} item={item} />)`,
    },
    { id: 'b5', type: 'heading', level: 2, text: 'Fiber: reconciliation becomes interruptible' },
    {
      id: 'b6',
      type: 'text',
      markdown:
        'Before React 16, reconciliation was a single synchronous recursive walk — once started, it ' +
        "couldn't be paused, and a large tree could block the main thread long enough to drop frames. " +
        '**Fiber** rewrote this as a unit-of-work linked list that can be paused, resumed, aborted, or ' +
        'reprioritized between units. This is what makes concurrent features (transitions, Suspense, ' +
        'time-slicing) possible — the renderer can yield back to the browser/UI thread mid-render.',
    },
    {
      id: 'b7',
      type: 'diagram',
      title: 'Render phase vs. commit phase',
      nodes: [
        'State update scheduled',
        'Render phase (interruptible, can be discarded)',
        'Reconciliation produces effect list',
        'Commit phase (synchronous, not interruptible)',
        'Host mutations applied + effects run',
      ],
    },
    {
      id: 'b8',
      type: 'warning',
      text:
        'The render phase can run more than once for the same update (React may throw work away and ' +
        'restart it), so component bodies must stay pure — no side effects, no mutating refs during render.',
    },
    { id: 'b9', type: 'heading', level: 2, text: 'Why this matters for React Native' },
    {
      id: 'b10',
      type: 'text',
      markdown:
        'The New Architecture keeps this exact reconciliation model on the JS side — Fabric changes ' +
        'what happens *after* reconciliation (how the resulting tree is committed to native views), not ' +
        'the diffing algorithm itself. Understanding reconciliation is what lets you reason correctly ' +
        'about `React.memo`, why a list re-renders, and where a re-render storm is actually coming from.',
    },
    {
      id: 'b11',
      type: 'real-world-example',
      title: 'Context re-render fan-out',
      description:
        'A single Context value change re-renders every consumer, even ones that only read a slice ' +
        "that didn't change — because reconciliation compares the whole context value by reference, not " +
        'per-field. This is the most common cause of "unrelated" components re-rendering together.',
    },
  ],
}
