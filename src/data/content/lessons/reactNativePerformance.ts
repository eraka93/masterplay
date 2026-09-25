import type { Lesson } from '@/models'

export const reactNativePerformanceLesson: Lesson = {
  id: 'lesson-rn-performance',
  moduleId: 'module-rn-performance-fundamentals',
  subjectId: 'react-native-performance',
  order: 1,
  title: 'React Native Performance Fundamentals',
  summary:
    'The frame budget, the two threads that matter most, and where real performance problems ' +
    'usually come from in a React Native app.',
  difficulty: 'intermediate',
  estimatedMinutes: 30,
  tags: ['performance', 'react-native', 'flatlist'],
  quizId: 'quiz-rn-performance',
  blocks: [
    { id: 'b1', type: 'heading', level: 2, text: 'The frame budget' },
    {
      id: 'b2',
      type: 'text',
      markdown:
        'A 60Hz display needs a new frame every ~16.6ms; a 120Hz ProMotion display needs one every ' +
        '~8.3ms. Miss the budget and a frame is dropped — the user perceives that as stutter. Performance ' +
        'work in React Native is almost always about staying inside that budget on the thread that matters ' +
        'for a given piece of work.',
    },
    { id: 'b3', type: 'heading', level: 2, text: 'Two threads, two different failure modes' },
    {
      id: 'b4',
      type: 'text',
      markdown:
        '- **JS thread** blocked → touch handling, state updates, and list data processing stall. Feels ' +
        'like "the app is frozen."\n' +
        '- **UI thread** blocked → native rendering/animation stalls even if JS is fine. Feels like ' +
        '"scrolling is choppy" even though your `onPress` fired instantly.\n\n' +
        'The fix is different depending on which thread is actually the bottleneck — profile before you ' +
        'guess.',
    },
    { id: 'b5', type: 'heading', level: 2, text: 'FlatList: the most common perf conversation' },
    {
      id: 'b6',
      type: 'text',
      markdown:
        'FlatList virtualizes — it only renders rows near the viewport, not the whole dataset. The knobs ' +
        'that matter most when a long list drops frames:\n\n' +
        '- `windowSize` — how many screens worth of content stay rendered outside the viewport. Smaller ' +
        'reduces memory/render cost, but risks blank flashes on fast scroll.\n' +
        '- `removeClippedSubviews` — unmounts native views that scroll fully offscreen (Android especially).\n' +
        '- `getItemLayout` — skip dynamic measurement entirely when row height is known and fixed.\n' +
        '- **Row memoization** — an unmemoized row, or a memoized row receiving a new inline callback prop ' +
        'every render, re-renders every row on every parent update regardless of virtualization.',
    },
    {
      id: 'b7',
      type: 'warning',
      text:
        'Tuning FlatList props without profiling first is guessing. The same symptom ("scroll is janky") ' +
        'can be caused by row re-renders, oversized images, layout thrashing, or genuinely too much native ' +
        'view churn — each has a different fix.',
    },
    {
      id: 'b8',
      type: 'real-world-example',
      title: 'FlashList',
      description:
        "Shopify's FlashList reuses view instances (recycling, like a native RecyclerView/UICollectionView) " +
        "instead of mounting/unmounting on every scroll — a structurally different strategy from FlatList's " +
        'render-and-discard virtualization, which is why it outperforms FlatList on very large or ' +
        'variable-height lists specifically.',
    },
    { id: 'b9', type: 'heading', level: 2, text: 'A practical debugging order' },
    {
      id: 'b10',
      type: 'text',
      markdown:
        '1. Reproduce on a real low/mid-end device, not just a simulator or your dev phone.\n' +
        '2. Profile — identify whether JS or UI thread is actually dropping frames.\n' +
        '3. Find the specific component/operation, not just "the screen."\n' +
        '4. Fix the specific cause, then re-profile to confirm the fix actually worked.\n\n' +
        'Skipping step 4 is how "performance fixes" accumulate that never actually fixed anything.',
    },
  ],
}
