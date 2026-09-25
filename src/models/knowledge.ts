export type KnowledgeTag =
  | 'react-native'
  | 'javascript'
  | 'typescript'
  | 'performance'
  | 'android'
  | 'ios'
  | 'firebase'
  | 'architecture'
  | 'debugging'
  | 'networking'
  | 'security'
  | 'testing'
  | 'state-management'

export interface KnowledgeCodeExample {
  language: string
  code: string
  caption?: string
}

export interface KnowledgeItem {
  id: string
  title: string
  summary: string
  content: string
  codeExamples: KnowledgeCodeExample[]
  externalLinks: { label: string; href: string }[]
  personalNotes?: string
  relatedLessonIds: string[]
  relatedProblemIds: string[]
  tags: KnowledgeTag[]
  createdAt: string
  updatedAt: string
}

export type BookmarkTargetType = 'lesson' | 'knowledge-item' | 'real-world-problem'

export interface Bookmark {
  id: string
  userId: string
  targetType: BookmarkTargetType
  targetId: string
  createdAt: string
}

export interface Note {
  id: string
  userId: string
  lessonId: string
  /** Plain text with inline code fences and links; rendered as lightweight markdown. */
  content: string
  updatedAt: string
}
