'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { type InterviewTheme, prompts, THEME_TO_TITLE } from '@/app/interviews/_prompts'
import { getDb } from '@/drizzle/client'
import { type InsertInterview, interview } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'

export const initInterviewAction = async (theme: InterviewTheme) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const newContent = {
    id: crypto.randomUUID(),
    type: 'text',
    role: 'system',
    content: prompts[theme],
    createdAt: new Date(),
  } satisfies InsertInterview['content'][number]

  const newInterview = {
    title: `${THEME_TO_TITLE[theme]}に関するインタビュー`,
    content: [newContent],
    authorId: session.user.id,
    theme: THEME_TO_TITLE[theme],
  } satisfies InsertInterview

  const db = await getDb()
  const [insertedInterview] = await db
    .insert(interview)
    .values({ ...newInterview })
    .returning()

  redirect(`/interviews/${insertedInterview.id}`)
}
