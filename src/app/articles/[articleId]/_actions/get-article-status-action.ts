'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/drizzle/client'
import { type ArticleStatus, article } from '@/drizzle/schema/d1/article-schema'
import { auth } from '@/lib/auth'

export const getArticleStatusAction = async (articleId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = await getDb()
  const [selectedArticle] = await db
    .select({
      status: article.status,
    }) //
    .from(article)
    .where(eq(article.id, articleId))

  return selectedArticle.status as ArticleStatus
}
