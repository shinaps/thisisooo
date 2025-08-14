'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { type InterviewTheme, prompts, THEME_TO_TITLE } from '@/app/interviews/_prompts'
import { getDb } from '@/drizzle/client'
import { type InsertInterview, interview } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'

const generalPrompt = `

## 出力ルール
会話文の出力時はマークダウン記法（##、**、- など）を使用せず、自然な日本語のみで回答してください。
インタビューの進行や質問もすべて会話形式で行い、装飾や記号は使わないようにしてください。
`

export const initInterviewAction = async (theme: InterviewTheme) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const prompt = prompts[theme] + generalPrompt

  const newContent = {
    id: crypto.randomUUID(),
    type: 'text',
    role: 'system',
    content: prompt,
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
