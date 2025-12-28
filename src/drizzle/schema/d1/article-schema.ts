import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { interview } from '@/drizzle/schema/d1/interview-schema'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'

export const ARTICLE_STATUS = {
  INIT: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
}
export type ArticleStatus = (typeof ARTICLE_STATUS)[keyof typeof ARTICLE_STATUS]

export const ARTICLE_TONE = {
  INTERVIEW: 'interview',
  BLOG: 'blog',
} as const
export type ArticleTone = (typeof ARTICLE_TONE)[keyof typeof ARTICLE_TONE]

export const article = sqliteTable(
  'article',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    interviewId: text('interview_id')
      .notNull()
      .references(() => interview.id, { onDelete: 'cascade' })
      .unique(),
    title: text('title'),
    theme: text('theme').notNull(),
    tone: text('tone').$type<ArticleTone>().notNull().default(ARTICLE_TONE.INTERVIEW),
    customInstruction: text('custom_instruction'),
    thumbnailUrl: text('thumbnailUrl'),
    content: text('content', { mode: 'text' }),
    status: integer('status', { mode: 'number' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    published: integer('published', { mode: 'boolean' })
      .$defaultFn(() => false)
      .notNull(),
    authorId: text('author_id')
      .notNull()
      .references(() => userProfile.userId, { onDelete: 'cascade' }),
  },
  (table) => [
    index('article_latest_published_idx') //
      .on(sql`${table.createdAt} DESC`)
      .where(sql`${table.published} = 1`),
  ],
)

export type InsertArticle = typeof article.$inferInsert
export type SelectArticle = typeof article.$inferSelect
