'use server'

import { generateText } from 'ai'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { TextContent } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

const generateContext = (messages: TextContent[]) => {
  let context = ''

  context += '今までの会話を以下に示します。文体などに関してはこちらの会話を参考にしてください。\n\n'

  for (const message of messages) {
    if (message.role === 'user') {
      context += `User: ${message.content}\n`
    } else if (message.role === 'assistant') {
      context += `Assistant: ${message.content}\n`
    }
  }

  return context
}

const prompt = `
口語の文体を保ちながら音声入力による誤字を修正し、不要な言葉などを取り除いたテキストを返してください。
出力は修正済みテキストのみを返すようにしてください。
`

export const normalizeTextAction = async (messages: TextContent[], input: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const context = generateContext(messages)

  const { text } = await generateText({
    model: openai('gpt-5-chat-latest'),
    messages: [
      { role: 'system', content: `${prompt} \n\n ${context}` }, //
      { role: 'user', content: input },
    ],
  })

  return text
}
