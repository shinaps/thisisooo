'use server'

import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/drizzle/client'
import { ARTICLE_STATUS, type ArticleTone, article } from '@/drizzle/schema/d1/article-schema'
import { interview } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'

export const initGenerateArticleAction = async (interviewId: string, tone: ArticleTone, customInstruction: string | null = null) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }
  const db = getDb()
  const [selectedInterview] = await db
    .select() //
    .from(interview)
    .where(
      and(
        eq(interview.id, interviewId), //
        eq(interview.authorId, session.user.id),
      ),
    )
    .limit(1)

  if (!selectedInterview) {
    throw new Error('Interview not found')
  }

  const [createdArticle] = await db
    .insert(article)
    .values({
      interviewId: selectedInterview.id,
      authorId: session.user.id,
      status: ARTICLE_STATUS.INIT,
      theme: selectedInterview.theme,
      tone: tone,
      customInstruction: customInstruction,
    })
    .returning()

  redirect(`/articles/${createdArticle.id}`)
}
