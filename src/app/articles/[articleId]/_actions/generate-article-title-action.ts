'use server'

import { createStreamableValue } from '@ai-sdk/rsc'
import { streamText } from 'ai'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/drizzle/client'
import { ARTICLE_STATUS, article } from '@/drizzle/schema/d1/article-schema'
import { interview, type SelectInterview, type TextContent } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

const basePrompt = `
あなたは日本語の熟練編集者です。  
以下のインタビュー逐語原稿から、60字以内でインタビュー記事のタイトルを作成してください。

[出力仕様]
出力はタイトルのみを返してください。

`

const generatePrompt = (interview: SelectInterview) => {
  const textContents = interview.content.filter((message) => message.type === 'text') satisfies TextContent[]
  const interviewMessages = textContents.filter((content) => content.role !== 'system')

  let prompt = basePrompt

  prompt += `--- ここからインタビュー原稿 ---\n\n`

  for (const message of interviewMessages) {
    if (message.role === 'user') {
      prompt += `回答者: ${message.content}\n\n`
    } else if (message.role === 'assistant') {
      prompt += `インタビュワー: ${message.content}\n\n`
    }
  }

  prompt += `--- ここまでインタビュー原稿 ---\n\n`

  return prompt
}

export const generateArticleTitleAction = async (interviewId: string, articleId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = await getDb()
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
  const prompt = generatePrompt(selectedInterview)
  const stream = createStreamableValue<string, Error>()

  ;(async () => {
    const { textStream } = streamText({
      model: openai('gpt-5-chat-latest'),
      prompt: prompt,
    })

    let title = ''
    for await (const text of textStream) {
      title += text
      stream.update(text)
    }

    await db
      .update(article)
      .set({
        title: title,
        status: ARTICLE_STATUS.IN_PROGRESS,
      })
      .where(eq(article.id, articleId))

    stream.done()
  })()

  return {
    title: stream.value,
  }
}
