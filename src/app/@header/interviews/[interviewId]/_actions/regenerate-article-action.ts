'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { initGenerateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/init-generate-article-action'
import { getDb } from '@/drizzle/client'
import { type ArticleTone, article } from '@/drizzle/schema/d1/article-schema'

export const regenerateArticleAction = async (
  interviewId: string,
  articleId: string,
  tone: ArticleTone,
  customInstruction: string | null = null,
) => {
  const db = getDb()

  // 記事を削除
  await db.delete(article).where(eq(article.id, articleId))

  // 指定されたトーン・カスタム指示で再生成
  await initGenerateArticleAction(interviewId, tone, customInstruction)
}
