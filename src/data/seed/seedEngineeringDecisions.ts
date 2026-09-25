import type { EngineeringDecision } from '@/models'

export function createSeedEngineeringDecisions(): EngineeringDecision[] {
  return [
    {
      id: 'decision-zustand-vs-redux',
      title: 'Redux vs Zustand for client state',
      projectId: 'ontruckloadboard',
      date: '2025-06-10',
      problem: 'Needed a client-state solution for a mid-size app with several cross-screen flows.',
      context:
        'Team of 4, tight timeline, most state was actually server state better served by React ' +
        'Query; only a small slice of truly global client state (auth, active load draft) remained.',
      options: [
        {
          id: 'redux',
          name: 'Redux (Redux Toolkit)',
          advantages: ['Mature ecosystem', 'Strong devtools', 'Familiar to most hires'],
          disadvantages: [
            'Boilerplate even with RTK',
            'Overkill for the small amount of global state left',
          ],
        },
        {
          id: 'zustand',
          name: 'Zustand',
          advantages: [
            'Minimal boilerplate',
            'No providers needed',
            'Easy to co-locate with feature code',
          ],
          disadvantages: ['Smaller ecosystem', 'Less structure enforced by the tool itself'],
        },
      ],
      chosenOptionId: 'zustand',
      reason:
        'React Query already owned server state; the remaining global client state was small enough ' +
        "that Redux's ceremony wasn't paying for itself.",
      tradeoffs:
        'Less enforced structure meant we had to be disciplined about store boundaries ourselves.',
      outcome: 'Store stayed small and easy to navigate a year later; no regrets on scale so far.',
      wouldChooseSameAgain: true,
      tags: ['state-management', 'architecture'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'decision-mmkv-vs-asyncstorage',
      title: 'AsyncStorage vs MMKV for local persistence',
      projectId: 'fndservice',
      date: '2025-09-02',
      problem:
        'AsyncStorage reads were showing up as a measurable cold-start cost on low-end Android.',
      context: 'App reads a moderate amount of cached data on launch to render the first screen.',
      options: [
        {
          id: 'asyncstorage',
          name: 'AsyncStorage',
          advantages: ['Zero native setup', 'Works everywhere including Expo Go'],
          disadvantages: [
            'Async-only, slower for synchronous reads on startup',
            'Bridge-bound in old architecture',
          ],
        },
        {
          id: 'mmkv',
          name: 'MMKV',
          advantages: ['Synchronous, very fast reads/writes', 'Much lower startup cost'],
          disadvantages: ['Requires a dev client / native build', 'Not usable in Expo Go'],
        },
      ],
      chosenOptionId: 'mmkv',
      reason: 'Already shipping a custom dev client, so the Expo Go constraint did not apply.',
      tradeoffs: 'Slightly more native surface area to maintain across upgrades.',
      outcome: 'Cold start improved measurably on the low-end Android device we benchmark against.',
      wouldChooseSameAgain: true,
      tags: ['react-native', 'performance', 'architecture'],
      createdAt: new Date().toISOString(),
    },
  ]
}
