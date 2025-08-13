'use server'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'
import { auth } from '@/lib/auth'

export const updateArticlePublishStateAction = async (articleId: string, isPublished: boolean) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }
  const db = await getDb()
  const [updated] = await db
    .update(article)
    .set({
      published: isPublished,
    })
    .where(eq(article.id, articleId))
    .returning({ published: article.published })

  return updated.published
}
