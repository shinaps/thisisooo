import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from '@/drizzle/schema/auth-schema'

const CONTENT_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
} as const

type ContentType = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE]

type BaseContent = {
  id: string
  type: ContentType
  createdAt: Date
}

export type TextContent = BaseContent & {
  type: typeof CONTENT_TYPE.TEXT
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type ImageContent = BaseContent & {
  type: typeof CONTENT_TYPE.IMAGE
  url: string
  alt?: string
}

export type Content = TextContent | ImageContent

export const interview = sqliteTable('interview', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  theme: text('theme').notNull(),
  content: text('content', { mode: 'json' }) //
    .$type<Content[]>()
    .notNull(),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export type InsertInterview = typeof interview.$inferInsert
export type SelectInterview = typeof interview.$inferSelect
