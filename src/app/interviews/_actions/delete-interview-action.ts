'use server'

import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/drizzle/client'
import { interview } from '@/drizzle/schema/interview-schema'
import { auth } from '@/lib/auth'

export const deleteInterviewAction = async (interviewId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  await db.delete(interview).where(
    and(
      eq(interview.id, interviewId), //
      eq(interview.authorId, session.user.id),
    ),
  )
}
