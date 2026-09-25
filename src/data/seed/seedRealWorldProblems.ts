import type { RealWorldProblem } from '@/models'

export function createSeedRealWorldProblems(): RealWorldProblem[] {
  return [
    {
      id: 'problem-flatlist-frame-drops',
      title: 'FlatList dropping frames on a 5,000-row feed',
      projectId: 'mozzart-sport',
      technologies: ['React Native', 'FlatList'],
      date: '2025-11-04',
      problemDescription:
        'A live odds feed rendered as a FlatList started dropping frames badly once the list ' +
        'grew past a few thousand rows, especially during fast scrolling.',
      symptoms: 'Visible stutter while scrolling; JS thread FPS dropped below 20 in Flipper.',
      errorMessages: '',
      logs: 'Flipper Perf Monitor: UI 55fps / JS 18fps during scroll fling.',
      initialHypothesis: 'Assumed it was a rendering cost problem in the row component itself.',
      possibleCauses: [
        'Expensive row component doing unnecessary work per render',
        'Missing key/data stability causing re-renders',
        'Too many rows rendered outside the viewport (windowing config)',
        'Inline function/style props defeating memoization',
      ],
      investigation:
        'Profiled with Flipper and the React DevTools profiler. Row component re-rendered on every ' +
        'parent update because it received a new inline onPress handler each render. windowSize was ' +
        'also left at the default, rendering far more offscreen rows than needed for this layout.',
      finalCause:
        'Combination of (1) non-memoized row component re-rendering on unrelated parent state changes, ' +
        'and (2) default windowSize over-rendering offscreen content.',
      solution:
        'Wrapped the row in React.memo with a custom comparator, hoisted the onPress handler with ' +
        'useCallback keyed by row id, and tuned windowSize/maxToRenderPerBatch/removeClippedSubviews ' +
        'for this specific list.',
      codeBefore:
        'function Row({ item, onSelect }) {\n  return <Pressable onPress={() => onSelect(item.id)}>...</Pressable>\n}',
      codeAfter:
        'const Row = React.memo(function Row({ item, onSelect }) {\n  return <Pressable onPress={onSelect}>...</Pressable>\n}, (a, b) => a.item.id === b.item.id && a.item.odds === b.item.odds)',
      whatILearned:
        'Inline callbacks passed to memoized children silently defeat memoization — the fix is almost ' +
        'always to hoist and stabilize the callback identity, not to add more memoization.',
      tags: ['react-native', 'performance', 'flatlist'],
      difficulty: 'medium',
      timeSpentMinutes: 180,
      wouldSolveFasterToday: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'problem-ios-background-fetch-silent-failure',
      title: 'iOS background sync silently stopped after app update',
      projectId: 'underdogz',
      technologies: ['React Native', 'iOS', 'Background Fetch'],
      date: '2025-08-19',
      problemDescription:
        'Background data sync worked in TestFlight but silently stopped firing for a subset of ' +
        'users after a routine release, with no crash reports.',
      symptoms:
        'Users reported stale data after opening the app after being backgrounded overnight.',
      errorMessages: 'None — the task simply never fired for affected users.',
      logs: 'No corresponding BGTaskScheduler logs in device console for affected sessions.',
      initialHypothesis: 'Assumed a regression in the JS-side sync logic.',
      possibleCauses: [
        'JS-side sync logic bug',
        'Background task identifier mismatch between Info.plist and registration call',
        'iOS silently deprioritizing the task due to battery/usage heuristics',
      ],
      investigation:
        'Reproduced on a real device (not simulator, which does not reliably invoke background ' +
        'tasks). Found the task identifier registered in native code no longer matched the string ' +
        'declared in Info.plist after a refactor — iOS was rejecting the registration outright.',
      finalCause:
        'Mismatched BGTaskScheduler identifier between native registration and Info.plist.',
      solution:
        'Centralized the task identifier as a single constant shared between the plist and the ' +
        'registration call, and added a startup assertion that fails loudly in dev if they diverge.',
      whatILearned:
        'Background execution APIs fail silent by default — treat the simulator as unreliable for this ' +
        'and always verify on-device, and make identifier mismatches impossible instead of just careful.',
      tags: ['ios', 'react-native', 'debugging'],
      difficulty: 'hard',
      timeSpentMinutes: 300,
      wouldSolveFasterToday: true,
      createdAt: new Date().toISOString(),
    },
  ]
}
