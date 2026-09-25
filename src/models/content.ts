/**
 * Content hierarchy: LearningPath -> Subject -> Module -> Lesson -> LessonBlock.
 *
 * A LearningPath is a curated sequence through a subset of subjects (e.g. "Senior Mobile
 * Engineer"). Subjects are the 34 top-level roadmap categories from the product spec; each
 * subject groups modules, which group lessons, which are built from typed content blocks.
 */

export type SubjectSlug =
  | 'javascript-deep-dive'
  | 'typescript-deep-dive'
  | 'react-internals'
  | 'react-native-fundamentals'
  | 'react-native-advanced'
  | 'react-native-architecture'
  | 'react-native-new-architecture'
  | 'hermes'
  | 'jsi'
  | 'fabric'
  | 'turbomodules'
  | 'codegen'
  | 'react-native-performance'
  | 'react-native-debugging'
  | 'networking'
  | 'offline-first'
  | 'state-management'
  | 'android-fundamentals'
  | 'kotlin-for-rn'
  | 'ios-fundamentals'
  | 'swift-for-rn'
  | 'push-notifications'
  | 'deep-linking'
  | 'mobile-security'
  | 'testing'
  | 'ci-cd'
  | 'app-stores'
  | 'backend-fundamentals'
  | 'nodejs'
  | 'databases'
  | 'api-design'
  | 'websockets'
  | 'system-design'
  | 'mobile-system-design'

export type SubjectTrack = 'javascript' | 'react-native-core' | 'native' | 'backend' | 'craft'

export interface Subject {
  id: SubjectSlug
  order: number
  title: string
  shortTitle: string
  description: string
  track: SubjectTrack
  /** Slugs of subjects that should be substantially complete before this one is recommended. */
  recommendedPrerequisites: SubjectSlug[]
  icon: string
  estimatedHours: number
}

export interface Module {
  id: string
  subjectId: SubjectSlug
  order: number
  title: string
  description: string
  lessonIds: string[]
}

export type LessonDifficulty = 'foundational' | 'intermediate' | 'advanced'

export interface Lesson {
  id: string
  moduleId: string
  subjectId: SubjectSlug
  order: number
  title: string
  summary: string
  difficulty: LessonDifficulty
  estimatedMinutes: number
  tags: string[]
  blocks: LessonBlock[]
  quizId?: string
  relatedLessonIds?: string[]
}

// ---------------------------------------------------------------------------
// Block-based lesson content
// ---------------------------------------------------------------------------

interface BlockBase {
  id: string
}

export interface HeadingBlock extends BlockBase {
  type: 'heading'
  level: 2 | 3 | 4
  text: string
}

export interface TextBlock extends BlockBase {
  type: 'text'
  markdown: string
}

export interface CodeBlock extends BlockBase {
  type: 'code'
  language: string
  code: string
  caption?: string
}

export interface ImageBlock extends BlockBase {
  type: 'image'
  src: string
  alt: string
  caption?: string
}

export interface DiagramBlock extends BlockBase {
  type: 'diagram'
  title: string
  /** Ordered list of stages/nodes rendered as a simple horizontal or layered diagram. */
  nodes: string[]
  description?: string
}

export interface LinkBlock extends BlockBase {
  type: 'link'
  href: string
  label: string
  description?: string
}

export interface DocReferenceBlock extends BlockBase {
  type: 'doc-reference'
  href: string
  source: string
  label: string
}

export interface QuoteBlock extends BlockBase {
  type: 'quote'
  quote: string
  attribution?: string
}

export interface TipBlock extends BlockBase {
  type: 'tip'
  text: string
}

export interface WarningBlock extends BlockBase {
  type: 'warning'
  text: string
}

export interface QuestionBlock extends BlockBase {
  type: 'question'
  prompt: string
  /** Rendered as a reveal-to-check prompt, not scored — scored questions live in Quiz. */
  discussion: string
}

export interface RealWorldExampleBlock extends BlockBase {
  type: 'real-world-example'
  title: string
  description: string
  source?: string
}

export type LessonBlock =
  | HeadingBlock
  | TextBlock
  | CodeBlock
  | ImageBlock
  | DiagramBlock
  | LinkBlock
  | DocReferenceBlock
  | QuoteBlock
  | TipBlock
  | WarningBlock
  | QuestionBlock
  | RealWorldExampleBlock
