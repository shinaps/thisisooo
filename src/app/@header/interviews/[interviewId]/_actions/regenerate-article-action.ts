'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { initGenerateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/init-generate-article-action'
import { getDb } from '@/drizzle/client'
import { ARTICLE_TONE, article } from '@/drizzle/schema/d1/article-schema'

export const regenerateArticleAction = async (interviewId: string, articleId: string) => {
  const db = getDb()

  // 既存の記事のトーンを取得
  const [existingArticle] = await db.select({ tone: article.tone }).from(article).where(eq(article.id, articleId))

  // 記事を削除
  await db.delete(article).where(eq(article.id, articleId))

  // 既存の記事と同じトーンで再生成（存在しない場合はデフォルトのインタビュー形式）
  const tone = existingArticle?.tone ?? ARTICLE_TONE.INTERVIEW
  await initGenerateArticleAction(interviewId, tone)
}
