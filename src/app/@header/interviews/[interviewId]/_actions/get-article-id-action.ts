'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'
import { auth } from '@/lib/auth'

export const getArticleInfoAction = async (interviewId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = getDb()
  const [selected] = await db
    .select({
      id: article.id,
      tone: article.tone,
      customInstruction: article.customInstruction,
    })
    .from(article)
    .where(eq(article.interviewId, interviewId))

  if (!selected) {
    return null
  }

  return selected
}
