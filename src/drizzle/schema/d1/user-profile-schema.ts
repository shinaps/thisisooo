import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const userProfile = sqliteTable('user_profile', {
  userId: text('user_id').primaryKey(),
  name: text('name').notNull().default(''),
  username: text('username')
    .$defaultFn(() => crypto.randomUUID())
    .notNull()
    .unique(),
  image: text('image'),
  bio: text('bio').notNull().default(''),
  twitter: text('twitter').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export type InsertUserProfile = typeof userProfile.$inferInsert
export type SelectUserProfile = typeof userProfile.$inferSelect
