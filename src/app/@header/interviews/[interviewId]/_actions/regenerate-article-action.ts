'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { generateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/generate-article-action'
import { db } from '@/drizzle/client'
import { article } from '@/drizzle/schema/article-schema'

const deleteArticle = async (articleId: string) => {
  await db.delete(article).where(eq(article.id, articleId))
}

export const regenerateArticleAction = async (interviewId: string, articleId: string) => {
  await deleteArticle(articleId)
  await generateArticleAction(interviewId)
}
