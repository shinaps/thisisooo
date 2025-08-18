'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { initGenerateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/init-generate-article-action'
import { getDb } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'

const deleteArticle = async (articleId: string) => {
  const db = getDb()
  await db.delete(article).where(eq(article.id, articleId))
}

export const regenerateArticleAction = async (interviewId: string, articleId: string) => {
  await deleteArticle(articleId)
  await initGenerateArticleAction(interviewId)
}
