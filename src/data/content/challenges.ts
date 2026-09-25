import type { Challenge } from '@/models'

export const CHALLENGES: Challenge[] = [
  {
    id: 'challenge-flatlist-frame-drops',
    type: 'performance-problem',
    subjectId: 'react-native-performance',
    difficulty: 'medium',
    title: 'A 5,000-row FlatList is dropping frames',
    prompt:
      'A FlatList rendering roughly 5,000 rows drops frames noticeably while the user scrolls fast. ' +
      'Each row shows an avatar image, a name, and a status badge. Before reading further, think through ' +
      'what you would actually check first.',
    context:
      'The row component is a plain function component. The FlatList is otherwise using default props.',
    investigationPrompts: [
      'Is the JS thread or the UI thread dropping frames? How would you find out?',
      'Are row components re-rendering more often than necessary? Why might that happen?',
      'Is virtualization configured sensibly for this row size and dataset?',
      'Could the avatar images themselves be part of the cost?',
    ],
    approaches: [
      {
        id: 'approach-memoize-row',
        title: 'Memoize the row and stabilize callback props',
        description:
          'Wrap the row in React.memo and hoist any inline onPress/onLayout handlers with useCallback ' +
          'keyed by a stable id, so an unrelated parent re-render does not re-render every visible row.',
      },
      {
        id: 'approach-tune-virtualization',
        title: 'Tune FlatList virtualization props',
        description:
          'Set getItemLayout (row height is fixed here), adjust windowSize down from the default, and ' +
          'enable removeClippedSubviews on Android to reduce offscreen render/mount cost.',
      },
      {
        id: 'approach-flashlist',
        title: 'Switch to FlashList',
        description:
          'Replace FlatList with FlashList for its view-recycling strategy, which avoids mount/unmount ' +
          'churn entirely rather than just tuning how much gets virtualized.',
        recommended: true,
      },
      {
        id: 'approach-image-cost',
        title: 'Investigate image decode/layout cost',
        description:
          'Confirm avatar images are pre-sized and not being decoded/resized on the JS or UI thread per ' +
          'frame — a fixed-size, properly cached image request is cheap; an unbounded one is not.',
      },
    ],
    resolution:
      'In the real case this is modeled on (see the Real World Problems log), the actual cause was two ' +
      'compounding issues: an inline onPress handler defeating React.memo, and a default windowSize that ' +
      'over-rendered offscreen rows. The fix was memoization + stabilized callbacks + tuned virtualization ' +
      'props — not a rewrite. FlashList is the stronger long-term answer for lists at this scale, but the ' +
      'cheaper first move (memoize + stabilize + tune) resolved it without a dependency change. Prefer the ' +
      'cheapest fix that actually addresses the measured cause; escalate to FlashList when virtualization ' +
      'tuning alone plateaus.',
    tags: ['performance', 'flatlist', 'react-native'],
    xpReward: 30,
  },
  {
    id: 'challenge-predict-output-closures',
    type: 'predict-the-output',
    subjectId: 'javascript-deep-dive',
    difficulty: 'easy',
    title: 'Predict the output: closures in a loop',
    prompt: 'What does this log?',
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    language: 'javascript',
    investigationPrompts: [
      'Does `var` create a new binding per loop iteration, or share one binding?',
      'What value does `i` hold by the time any of the setTimeout callbacks actually run?',
    ],
    approaches: [
      { id: 'a1', title: '0, 1, 2', description: 'Each callback captures its own snapshot of i.' },
      {
        id: 'a2',
        title: '3, 3, 3',
        description:
          'var is function-scoped, not block-scoped — all three closures share the same binding, which is 3 by the time any callback runs.',
        recommended: true,
      },
      { id: 'a3', title: '0, 0, 0', description: 'All callbacks see the initial value.' },
    ],
    resolution:
      'The answer is 3, 3, 3. `var` has function scope, so there is only one `i` shared by all three ' +
      'closures — by the time the macrotask queue runs any of them, the loop has already finished and `i` ' +
      'is 3. Replacing `var` with `let` gives each iteration its own binding and produces 0, 1, 2.',
    tags: ['javascript', 'closures', 'scope'],
    xpReward: 30,
  },
  {
    id: 'challenge-mmkv-vs-asyncstorage',
    type: 'architecture-decision',
    subjectId: 'state-management',
    difficulty: 'medium',
    title: 'AsyncStorage vs. MMKV for a settings cache',
    prompt:
      'You need to persist a small amount of user settings (theme, notification preferences, ~10 keys) ' +
      'that should be readable synchronously at app startup, before the first render, to avoid a flash of ' +
      'default settings.',
    investigationPrompts: [
      'Does this app already ship a custom dev client, or does it need to run in Expo Go?',
      'Is the amount of data small enough that read/write throughput is not really the deciding factor?',
      'What does "readable before first render" actually require technically?',
    ],
    approaches: [
      {
        id: 'a1',
        title: 'AsyncStorage + a loading gate',
        description:
          'Show a brief loading state on startup while AsyncStorage resolves, then render with real settings.',
      },
      {
        id: 'a2',
        title: 'MMKV, read synchronously before the first render',
        description:
          "MMKV's synchronous API lets you read settings before React even mounts, eliminating the loading gate entirely.",
        recommended: true,
      },
      {
        id: 'a3',
        title: 'Bake defaults into the bundle, ignore persistence for v1',
        description:
          'Skip persistence and accept settings reset on every launch — usually unacceptable for user-facing preferences.',
      },
    ],
    resolution:
      "For a small, frequently-read-at-startup dataset, MMKV's synchronous API directly solves the " +
      '"flash of default settings" problem that AsyncStorage structurally cannot (it is async-only). The ' +
      'real constraint to check first is tooling: MMKV requires a custom native build and will not run in ' +
      'plain Expo Go, so the decision depends on what the project already ships.',
    tags: ['state-management', 'architecture', 'react-native'],
    xpReward: 30,
  },
  {
    id: 'challenge-find-the-bug-usestate-stale',
    type: 'find-the-bug',
    subjectId: 'react-internals',
    difficulty: 'medium',
    title: 'Find the bug: a counter that skips increments',
    prompt: 'This "increment by 3" button only ever increments the counter by 1. Why?',
    code: `function Counter() {
  const [count, setCount] = useState(0);

  function incrementByThree() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return <button onPress={incrementByThree}>{count}</button>;
}`,
    language: 'jsx',
    investigationPrompts: [
      'What value of `count` does each of the three setCount calls actually see?',
      'Are state updates within one event handler batched, and does that matter here?',
    ],
    approaches: [
      {
        id: 'a1',
        title: "It's a batching bug — need a functional updater",
        description:
          'All three calls close over the same `count` from this render, so each one just re-sets it to count + 1, not building on the previous call.',
        recommended: true,
      },
      {
        id: 'a2',
        title: 'setCount is async and one call is dropped',
        description:
          'setCount is not dropping calls — this is about which value of count each call reads.',
      },
    ],
    resolution:
      "All three calls read the same `count` from this render's closure, so each one computes the same " +
      'value (count + 1) and the last write wins. Fix: use the functional updater form, ' +
      '`setCount(c => c + 1)`, three times — each updater receives the latest pending state, not the ' +
      "render's stale snapshot.",
    tags: ['react', 'hooks', 'state'],
    xpReward: 30,
  },
]

export const CHALLENGES_BY_ID: Record<string, Challenge> = Object.fromEntries(
  CHALLENGES.map((challenge) => [challenge.id, challenge]),
)
