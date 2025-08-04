'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { db } from '@/drizzle/client'
import { interview } from '@/drizzle/schema/interview-schema'
import { auth } from '@/lib/auth'

export const countInterviews = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return 0
  }

  return db.$count(interview, eq(interview.authorId, session.user.id))
}
