'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/drizzle/client'
import { interview, type SelectInterview, type TextContent } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'

export const updateInterviewMessagesAction = async (interviewId: string, messages: TextContent[]): Promise<SelectInterview | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = await getDb()
  const [updatedInterview] = await db //
    .update(interview)
    .set({ content: messages })
    .where(eq(interview.id, interviewId))
    .returning()

  if (!updatedInterview) {
    return null
  }

  return updatedInterview
}
