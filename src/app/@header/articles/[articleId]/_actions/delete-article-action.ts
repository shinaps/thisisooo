'use server'

import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'
import { auth } from '@/lib/auth'

export const deleteArticleAction = async (articleId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }
  const db = getDb()
  await db.delete(article).where(
    and(
      eq(article.id, articleId), //
      eq(article.authorId, session.user.id),
    ),
  )
}
