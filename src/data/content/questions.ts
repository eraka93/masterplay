import type { Question } from '@/models'

export const QUESTIONS: Question[] = [
  // --- React Native Fundamentals ---
  {
    id: 'q-react-native-runtime-1',
    type: 'single-choice',
    topic: 'react-native-runtime',
    prompt:
      'Which statement most accurately describes the responsibility of Hermes in a React Native application?',
    options: [
      {
        id: 'a',
        text: 'Hermes converts React Native components directly into Android Views and iOS UIViews.',
      },
      { id: 'b', text: 'Hermes is the JavaScript engine that executes application JavaScript.' },
      { id: 'c', text: 'Hermes is the layout engine responsible for Flexbox calculations.' },
      { id: 'd', text: 'Hermes is another name for the React Native New Architecture.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Hermes is a JavaScript engine optimized for React Native workloads. It executes JavaScript and manages runtime concerns such as memory and garbage collection. Rendering native views, calculating layout and defining the overall React Native architecture are separate responsibilities.',
  },
  {
    id: 'q-react-native-runtime-2',
    type: 'true-false',
    topic: 'react-rendering',
    prompt:
      'Every execution of a React function component necessarily causes its corresponding native views to be recreated.',
    correctAnswer: false,
    explanation:
      'React can execute a component during the render phase without recreating every corresponding native view. Reconciliation determines the differences between the previous and next trees, and only relevant host changes are committed.',
  },
  {
    id: 'q-react-native-runtime-3',
    type: 'multiple-choice',
    topic: 'react-native-host-components',
    prompt: 'Which of the following are normally React Native host components?',
    options: [
      { id: 'a', text: 'View' },
      { id: 'b', text: 'Text' },
      { id: 'c', text: 'A custom ArticleCard function component' },
      { id: 'd', text: 'TextInput' },
    ],
    correctOptionIds: ['a', 'b', 'd'],
    explanation:
      'View, Text and TextInput are host components understood by the React Native renderer and backed by platform UI infrastructure. ArticleCard is an application-level React component whose output eventually resolves into host components.',
  },
  {
    id: 'q-react-native-runtime-4',
    type: 'code',
    topic: 'javascript-thread',
    prompt: 'What is the primary performance problem with this event handler?',
    language: 'tsx',
    code: `const handlePress = async () => {
  const result = expensiveCpuCalculation()
  setResult(result)
}`,
    options: [
      {
        id: 'a',
        text: 'Nothing. Declaring the function async guarantees that expensiveCpuCalculation runs on a background thread.',
      },
      {
        id: 'b',
        text: 'The CPU-heavy calculation can still synchronously block JavaScript execution.',
      },
      { id: 'c', text: 'setResult cannot be called from an async function.' },
      {
        id: 'd',
        text: 'React Native automatically moves synchronous calculations to the UI thread.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'The async keyword changes the function return semantics but does not automatically schedule synchronous CPU work on another thread. expensiveCpuCalculation still executes synchronously until it returns and can block the JavaScript runtime.',
  },
  {
    id: 'q-react-native-runtime-5',
    type: 'scenario',
    topic: 'react-native-performance',
    prompt:
      'A screen becomes temporarily unresponsive whenever a large dataset is synchronously transformed immediately after a button press. Network latency is not involved. What should you investigate first?',
    scenario:
      'The transformation iterates over tens of thousands of records, performs sorting and multiple calculations, and completes in approximately 700 ms. During that interval, JavaScript-driven interactions stop responding.',
    options: [
      { id: 'a', text: 'Whether the synchronous computation is blocking the JavaScript runtime.' },
      { id: 'b', text: 'Whether the Android XML layout has too many DOM nodes.' },
      { id: 'c', text: 'Whether Firebase Hosting has excessive latency.' },
      {
        id: 'd',
        text: 'Whether adding useCallback around the button handler fixes the computation.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'A 700 ms synchronous CPU task is long enough to monopolize JavaScript execution and delay JavaScript-driven interactions. The first investigation should therefore focus on the computation itself and whether it can be reduced, chunked, moved or redesigned. Memoizing the handler does not change the cost of the computation.',
  },
  {
    id: 'q-react-native-runtime-6',
    type: 'single-choice',
    topic: 'react-native-layout',
    prompt: 'Why is it inaccurate to describe React Native styling as normal CSS?',
    options: [
      { id: 'a', text: 'React Native does not support any Flexbox concepts.' },
      {
        id: 'b',
        text: 'React Native styles are JavaScript data consumed by the native layout/rendering system rather than rules interpreted by a browser CSS engine.',
      },
      { id: 'c', text: 'React Native converts every style object into an HTML style attribute.' },
      { id: 'd', text: 'React Native styling only works on Android.' },
    ],
    correctOptionId: 'b',
    explanation:
      'React Native deliberately uses many CSS-like property names and Flexbox concepts, but there is no browser cascade or DOM/CSS rendering engine. Style data is interpreted by React Native and its native layout/rendering infrastructure.',
  },

  // --- JS Event Loop ---
  {
    id: 'q-event-loop-1',
    type: 'code',
    topic: 'event-loop',
    language: 'javascript',
    code: `console.log('a');\nsetTimeout(() => console.log('b'), 0);\nPromise.resolve().then(() => console.log('c'));\nconsole.log('d');`,
    prompt: 'What order does this log in?',
    options: [
      { id: 'opt1', text: 'a, b, c, d' },
      { id: 'opt2', text: 'a, d, c, b' },
      { id: 'opt3', text: 'a, d, b, c' },
      { id: 'opt4', text: 'a, c, d, b' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'Synchronous code runs first (a, d), then the full microtask queue drains (c), then a single macrotask runs (b).',
  },
  {
    id: 'q-event-loop-2',
    type: 'true-false',
    topic: 'event-loop',
    prompt: '`setTimeout(fn, 0)` guarantees `fn` runs immediately, before any other JS executes.',
    correctAnswer: false,
    explanation:
      'It only guarantees fn is queued as a macrotask; it runs after current sync code and after the microtask queue is fully drained.',
  },
  {
    id: 'q-event-loop-3',
    type: 'single-choice',
    topic: 'event-loop',
    prompt: 'Which of these is a microtask, not a macrotask?',
    options: [
      { id: 'opt1', text: 'setTimeout callback' },
      { id: 'opt2', text: 'A resolved Promise .then() callback' },
      { id: 'opt3', text: 'A UI click event handler' },
      { id: 'opt4', text: 'setInterval callback' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'Promise callbacks (and queueMicrotask) are microtasks; timers and UI events are macrotasks.',
  },

  // --- React Reconciliation ---
  {
    id: 'q-reconciliation-1',
    type: 'single-choice',
    topic: 'reconciliation',
    prompt: 'Why is using array index as a React `key` risky for reorderable lists?',
    options: [
      { id: 'opt1', text: 'React ignores index keys entirely' },
      {
        id: 'opt2',
        text: 'It causes React to match the wrong element instances by position after a reorder',
      },
      { id: 'opt3', text: 'It disables virtualization' },
      { id: 'opt4', text: 'It throws a runtime error' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'React matches children by key across renders. With index keys, a reorder makes React reuse the wrong instance for a given position, potentially carrying over stale local state.',
  },
  {
    id: 'q-reconciliation-2',
    type: 'true-false',
    topic: 'reconciliation',
    prompt: 'The React render phase can run more than once for a single update before committing.',
    correctAnswer: true,
    explanation:
      'The render phase is interruptible and can be discarded and restarted; component bodies must stay pure because of this.',
  },
  {
    id: 'q-reconciliation-3',
    type: 'scenario',
    topic: 'reconciliation',
    scenario:
      'A component consumes a Context value that is an object `{ user, theme }`. Only `theme` ever changes, but every consumer re-renders whenever either field changes.',
    prompt: 'What is the most direct cause of this behavior?',
    options: [
      { id: 'opt1', text: 'React deep-compares context values by default and this is a bug' },
      {
        id: 'opt2',
        text: 'Context re-renders all consumers when the value reference changes, regardless of which field changed',
      },
      { id: 'opt3', text: 'useContext always re-renders on every parent render' },
      { id: 'opt4', text: 'This only happens with class components' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'Context compares the provided value by reference. A new object reference (even with one changed field) re-renders every consumer — splitting context or memoizing the value are the usual fixes.',
  },

  // --- JSI ---
  {
    id: 'q-jsi-1',
    type: 'single-choice',
    topic: 'jsi',
    prompt: 'What problem does JSI primarily solve compared to the classic Bridge?',
    options: [
      { id: 'opt1', text: 'It adds a JSON schema validator for native calls' },
      { id: 'opt2', text: 'It removes the need to serialize data across the JS/native boundary' },
      { id: 'opt3', text: 'It replaces JavaScript with C++ for app logic' },
      { id: 'opt4', text: 'It removes the need for a JS engine entirely' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'JSI gives native and JS direct references into the same runtime/heap, so calls no longer need to be serialized, queued, and batched.',
  },
  {
    id: 'q-jsi-2',
    type: 'single-choice',
    topic: 'jsi',
    prompt: 'What is a HostObject?',
    options: [
      { id: 'opt1', text: 'A JS object that has been serialized to JSON for the native side' },
      {
        id: 'opt2',
        text: 'A C++ class that JS can interact with as if it were a plain JS object, with live native-backed property access',
      },
      { id: 'opt3', text: 'A wrapper around setTimeout used internally by Hermes' },
      { id: 'opt4', text: 'A deprecated part of the classic Bridge' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'A HostObject exposes native data/behavior to JS as if it were a normal object, with each property access going live into C++.',
  },
  {
    id: 'q-jsi-3',
    type: 'true-false',
    topic: 'jsi',
    prompt: 'JSI is specific to the Hermes engine and cannot work with other JS engines.',
    correctAnswer: false,
    explanation:
      'JSI is engine-agnostic — Hermes implements the JSI Runtime interface, but JavaScriptCore or other engines can too.',
  },
  {
    id: 'q-jsi-4',
    type: 'true-false',
    topic: 'jsi',
    prompt:
      'A synchronous JSI call can still block the calling thread if the native work it does is slow.',
    correctAnswer: true,
    explanation:
      'JSI removes serialization overhead, not the cost of the underlying work — slow synchronous native code still blocks whichever thread called it.',
  },
  {
    id: 'q-jsi-5',
    type: 'single-choice',
    topic: 'jsi',
    prompt:
      'How are TurboModule method signatures typically connected to their native HostFunction implementation?',
    options: [
      { id: 'opt1', text: 'Manually, with no type checking' },
      {
        id: 'opt2',
        text: 'Through Codegen, which generates the glue code from a typed TS/Flow spec',
      },
      { id: 'opt3', text: 'By parsing JSDoc comments at runtime' },
      { id: 'opt4', text: 'TurboModules do not use HostFunctions' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'Codegen reads a typed spec and generates the native interface code that installs each method as a HostFunction.',
  },
  {
    id: 'q-jsi-6',
    type: 'scenario',
    topic: 'jsi',
    scenario:
      'A team wants to migrate a Bridge-era native module that does heavy image processing to a TurboModule with a synchronous method, hoping to "make it faster."',
    prompt: 'What is the biggest risk with this specific migration?',
    options: [
      { id: 'opt1', text: 'TurboModules cannot call synchronous native code at all' },
      {
        id: 'opt2',
        text: "Making the heavy processing synchronous means it now blocks the calling thread directly, since JSI doesn't make the work itself faster",
      },
      { id: 'opt3', text: 'JSI does not support image data types' },
      { id: 'opt4', text: 'Codegen cannot generate specs for modules with more than one method' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'JSI removes serialization overhead, not computation cost. Making genuinely slow work synchronous can make jank worse, not better — it should likely stay async (or move off the calling thread).',
  },

  // --- RN Performance ---
  {
    id: 'q-perf-1',
    type: 'single-choice',
    topic: 'performance',
    prompt:
      'A FlatList row is wrapped in React.memo but still re-renders every scroll frame. What is the most likely cause?',
    options: [
      { id: 'opt1', text: 'React.memo does not work inside FlatList' },
      {
        id: 'opt2',
        text: 'An inline function or object prop (e.g. onPress={() => ...}) is passed, creating a new reference every render',
      },
      { id: 'opt3', text: 'windowSize is set too high' },
      { id: 'opt4', text: 'The list has too few items' },
    ],
    correctOptionId: 'opt2',
    explanation:
      'React.memo does a shallow prop comparison. An inline arrow function creates a new reference every render, defeating memoization regardless of virtualization settings.',
  },
  {
    id: 'q-perf-2',
    type: 'scenario',
    topic: 'performance',
    scenario:
      'A screen feels frozen when the user taps a button, but a heavy background animation elsewhere keeps running smoothly.',
    prompt: 'Which thread is most likely the bottleneck?',
    options: [
      { id: 'opt1', text: 'The JS thread — touch handling and state updates are stalled' },
      { id: 'opt2', text: 'The UI thread — because the animation is unaffected' },
      { id: 'opt3', text: 'Neither — this points to a network issue' },
      { id: 'opt4', text: 'The shadow thread exclusively' },
    ],
    correctOptionId: 'opt1',
    explanation:
      "If native/UI-driven animation stays smooth while JS-driven interaction (taps, state) stalls, that's the signature of a blocked JS thread, not a UI thread problem.",
  },
  {
    id: 'q-perf-3',
    type: 'true-false',
    topic: 'performance',
    prompt:
      'FlashList outperforms FlatList mainly because it uses a smarter diffing algorithm in JS.',
    correctAnswer: false,
    explanation:
      "FlashList's main advantage is view recycling (reusing native view instances) rather than FlatList's mount/unmount-per-item virtualization — a structural difference, not just a smarter diff.",
  },
]

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((question) => [question.id, question]),
)
