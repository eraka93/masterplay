import type { Lesson } from '@/models'

export const reactNativeFundamentalsLesson: Lesson = {
  id: 'lesson-react-native-runtime-rendering',
  moduleId: 'module-react-native-runtime',
  subjectId: 'react-native-fundamentals',
  order: 1,
  title: 'React Native Runtime, Rendering and Thread Model',
  summary:
    'Understand what actually happens between your React component and a native view on iOS or Android, including the JavaScript runtime, native rendering, thread boundaries, state updates and the role of Hermes.',
  difficulty: 'foundational',
  estimatedMinutes: 45,
  tags: [
    'react-native',
    'runtime',
    'rendering',
    'hermes',
    'threads',
    'reconciliation',
    'performance',
  ],
  quizId: 'quiz-react-native-runtime-rendering',
  relatedLessonIds: [
    'lesson-react-reconciliation',
    'lesson-rn-bridge',
    'lesson-jsi',
    'lesson-hermes',
  ],
  blocks: [
    {
      id: 'rn-runtime-heading-1',
      type: 'heading',
      level: 2,
      text: 'React Native is not React running inside a WebView',
    },
    {
      id: 'rn-runtime-text-1',
      type: 'text',
      markdown:
        'React Native uses **React as the declarative programming model**, but the rendered output is native platform UI rather than DOM elements. A component such as `View` eventually corresponds to platform-native UI infrastructure. Your JavaScript describes the desired UI tree, React calculates changes, and React Native coordinates those changes with the native renderer.',
    },
    {
      id: 'rn-runtime-warning-1',
      type: 'warning',
      text: 'Thinking about React Native as "React for web, but on mobile" leads to incorrect architectural decisions. There is no browser DOM, CSS layout engine, document flow, or browser rendering pipeline underneath a normal React Native screen.',
    },
    {
      id: 'rn-runtime-diagram-1',
      type: 'diagram',
      title: 'High-level rendering path',
      nodes: [
        'React Component',
        'React Reconciliation',
        'React Native Renderer',
        'Native View Tree',
        'iOS / Android Screen',
      ],
      description:
        'The exact internals differ between the legacy and New Architecture, but the conceptual responsibility boundaries remain useful.',
    },
    { id: 'rn-runtime-heading-2', type: 'heading', level: 2, text: 'The JavaScript runtime' },
    {
      id: 'rn-runtime-text-2',
      type: 'text',
      markdown:
        'Your application JavaScript must execute inside a JavaScript engine. In modern React Native applications this is commonly **Hermes**. Hermes executes your JavaScript and TypeScript output, manages objects, performs garbage collection and runs the JavaScript event loop. React itself executes in this JavaScript environment.',
    },
    {
      id: 'rn-runtime-text-3',
      type: 'text',
      markdown:
        'A useful mental model is to separate **React**, **React Native**, and **Hermes**:\n\n- React decides what the component tree should look like.\n- React Native connects that tree to mobile platform capabilities.\n- Hermes executes the JavaScript that drives the application.\n\nHermes is not a renderer and React Native is not a JavaScript engine.',
    },
    {
      id: 'rn-runtime-diagram-2',
      type: 'diagram',
      title: 'Runtime responsibility',
      nodes: [
        'Application JavaScript',
        'Hermes',
        'React',
        'React Native Renderer',
        'Native Platform',
      ],
    },
    {
      id: 'rn-runtime-code-1',
      type: 'code',
      language: 'tsx',
      caption: 'A normal component still produces native UI rather than HTML.',
      code: `import React, { useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export function CounterScreen() {
  const [count, setCount] = useState(0)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count: {count}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setCount(current => current + 1)}
        style={styles.button}
      >
        <Text>Increment</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
})`,
    },
    {
      id: 'rn-runtime-question-1',
      type: 'question',
      prompt:
        'When setCount() executes, does React Native immediately mutate the visible native Text view?',
      discussion:
        'No. The state update schedules React work. React computes the next component output, compares it with the previous tree and determines the required changes. React Native then commits the relevant host-component changes to the native rendering system. Thinking in terms of scheduling, reconciliation and commit is more accurate than thinking of setState as directly changing a native view.',
    },
    {
      id: 'rn-runtime-heading-3',
      type: 'heading',
      level: 2,
      text: 'React render does not mean screen render',
    },
    {
      id: 'rn-runtime-text-4',
      type: 'text',
      markdown:
        'One of the most important distinctions in React performance work is the difference between a **React render** and a **native visual update**. A function component executing again does not automatically mean that every corresponding native view is recreated or visually changed.',
    },
    {
      id: 'rn-runtime-text-5',
      type: 'text',
      markdown:
        'During reconciliation, React compares the new element tree with the previous one. Only the changes that survive reconciliation eventually need to reach the host environment. Therefore, "this component rendered ten times" and "the native UI was rebuilt ten times" are not equivalent statements.',
    },
    {
      id: 'rn-runtime-code-2',
      type: 'code',
      language: 'tsx',
      caption: 'A parent render does not necessarily imply meaningful native work for every child.',
      code: `import React, { memo, useState } from 'react'
import { Button, Text, View } from 'react-native'

type UserHeaderProps = {
  name: string
}

const UserHeader = memo(function UserHeader({
  name,
}: UserHeaderProps) {
  console.log('UserHeader render')

  return <Text>{name}</Text>
})

export function ProfileScreen() {
  const [count, setCount] = useState(0)

  return (
    <View>
      <UserHeader name="Milan" />

      <Text>Local counter: {count}</Text>

      <Button
        title="Increment"
        onPress={() => setCount(value => value + 1)}
      />
    </View>
  )
}`,
    },
    {
      id: 'rn-runtime-tip-1',
      type: 'tip',
      text: 'Do not add React.memo, useMemo or useCallback automatically. First identify whether re-rendering is actually expensive. Memoization itself has comparison, allocation and cognitive costs.',
    },
    { id: 'rn-runtime-heading-4', type: 'heading', level: 2, text: 'Thread boundaries matter' },
    {
      id: 'rn-runtime-text-6',
      type: 'text',
      markdown:
        'React Native developers often say "the JS thread" and "the UI thread". That simplification is useful, but senior-level debugging requires understanding why the distinction matters. JavaScript application logic normally executes independently from the platform main thread responsible for UI work. Expensive synchronous JavaScript can delay JavaScript-driven interactions even when native rendering itself is capable of continuing.',
    },
    {
      id: 'rn-runtime-diagram-3',
      type: 'diagram',
      title: 'Conceptual thread separation',
      nodes: [
        'User Interaction',
        'Native / UI Thread',
        'React Native Runtime',
        'JavaScript Execution',
        'State Update',
        'Commit',
        'Native UI',
      ],
      description:
        'This is intentionally conceptual. Modern React Native internals are more nuanced than a single permanently isolated JS thread talking through a single bridge.',
    },
    {
      id: 'rn-runtime-code-3',
      type: 'code',
      language: 'tsx',
      caption: 'Synchronous CPU-heavy JavaScript can block application logic.',
      code: `import React, { useState } from 'react'
import { Button, Text, View } from 'react-native'

function calculatePrimeCount(limit: number): number {
  let count = 0

  for (let candidate = 2; candidate <= limit; candidate += 1) {
    let isPrime = true

    for (
      let divisor = 2;
      divisor * divisor <= candidate;
      divisor += 1
    ) {
      if (candidate % divisor === 0) {
        isPrime = false
        break
      }
    }

    if (isPrime) {
      count += 1
    }
  }

  return count
}

export function CpuHeavyScreen() {
  const [result, setResult] = useState<number | null>(null)

  const handlePress = () => {
    const primeCount = calculatePrimeCount(250_000)
    setResult(primeCount)
  }

  return (
    <View>
      <Button
        title="Run expensive calculation"
        onPress={handlePress}
      />

      <Text>
        {result === null
          ? 'No result'
          : \`Prime count: \${result}\`}
      </Text>
    </View>
  )
}`,
    },
    {
      id: 'rn-runtime-warning-2',
      type: 'warning',
      text: 'Async syntax does not automatically move CPU work away from the JavaScript runtime. Wrapping a CPU-heavy function in an async function or Promise does not make the computation execute on another thread.',
    },
    {
      id: 'rn-runtime-real-world-1',
      type: 'real-world-example',
      title: 'React Native Reanimated',
      description:
        'Reanimated is a good example of why understanding execution contexts matters. Modern Reanimated can execute worklets in a separate runtime associated with UI work, allowing animation logic to avoid depending on normal JavaScript-thread scheduling for every frame. That architectural difference is why it can provide smooth interactions even when the main application JavaScript runtime is busy.',
      source: 'react-native-reanimated',
    },
    {
      id: 'rn-runtime-heading-5',
      type: 'heading',
      level: 2,
      text: 'Native components and host components',
    },
    {
      id: 'rn-runtime-text-7',
      type: 'text',
      markdown:
        'Components such as `View`, `Text`, `Image` and `TextInput` are **host components** exposed by React Native. Your own `ArticleCard` or `NewsScreen` components are JavaScript abstractions. Eventually their output resolves into host components that the React Native renderer understands.',
    },
    {
      id: 'rn-runtime-code-4',
      type: 'code',
      language: 'tsx',
      code: `import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Article = {
  id: string
  title: string
  category: string
}

type ArticleCardProps = {
  article: Article
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.category}>
        {article.category}
      </Text>

      <Text style={styles.title}>
        {article.title}
      </Text>
    </View>
  )
}

export function NewsScreen() {
  const article: Article = {
    id: '42',
    title: 'React Native architecture explained',
    category: 'Engineering',
  }

  return <ArticleCard article={article} />
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  category: {
    fontSize: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
})`,
    },
    {
      id: 'rn-runtime-text-8',
      type: 'text',
      markdown:
        '`NewsScreen` and `ArticleCard` do not themselves represent platform-native views. After React resolves their output, the relevant host elements are `View` and `Text`. This distinction becomes important when reasoning about rendering cost, native integration and custom native components.',
    },
    { id: 'rn-runtime-heading-6', type: 'heading', level: 3, text: 'Layout is not browser CSS' },
    {
      id: 'rn-runtime-text-9',
      type: 'text',
      markdown:
        'React Native styling intentionally resembles CSS, but it is not CSS. Styles are JavaScript data passed to the native rendering system. Layout is primarily based on **Flexbox semantics**, historically implemented through Yoga. Browser-specific concepts such as selectors, cascade, pseudo-elements and arbitrary CSS properties do not exist in normal React Native styling.',
    },
    {
      id: 'rn-runtime-tip-2',
      type: 'tip',
      text: 'When a layout behaves unexpectedly, reason from the React Native layout model rather than searching for an equivalent browser CSS fix. Pay particular attention to flex direction defaults, parent constraints and explicit dimensions.',
    },
    { id: 'rn-runtime-heading-7', type: 'heading', level: 2, text: 'Common misconceptions' },
    {
      id: 'rn-runtime-text-10',
      type: 'text',
      markdown:
        '- **"React Native runs in a WebView."** Normal React Native UI is rendered using native host components, not browser DOM nodes.\n- **"Every React render recreates native views."** React reconciliation determines which host changes actually need to be committed.\n- **"Using async/await moves work to another thread."** It does not. CPU-heavy JavaScript can still block the JavaScript runtime.\n- **"Hermes is the React Native bridge."** Hermes is a JavaScript engine. Communication architecture is a separate concern.',
    },
    { id: 'rn-runtime-heading-8', type: 'heading', level: 2, text: 'Interview questions' },
    {
      id: 'rn-runtime-text-11',
      type: 'text',
      markdown:
        '1. What is the difference between React, React Native and Hermes?\n2. What is the difference between a React component render and a native UI update?\n3. Why can CPU-heavy JavaScript cause poor interaction responsiveness?\n4. What is a React Native host component?\n5. Why is React Native styling similar to CSS but fundamentally different from browser CSS?',
    },
    {
      id: 'rn-runtime-doc-1',
      type: 'doc-reference',
      href: 'https://reactnative.dev/architecture/overview',
      source: 'React Native',
      label: 'React Native Architecture Overview',
    },
    {
      id: 'rn-runtime-doc-2',
      type: 'doc-reference',
      href: 'https://reactnative.dev/docs/hermes',
      source: 'React Native',
      label: 'Using Hermes',
    },
    {
      id: 'rn-runtime-doc-3',
      type: 'doc-reference',
      href: 'https://react.dev/learn/render-and-commit',
      source: 'React',
      label: 'Render and Commit',
    },
  ],
}
