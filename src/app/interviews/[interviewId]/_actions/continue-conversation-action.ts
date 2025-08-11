'use server'
import { createStreamableValue } from '@ai-sdk/rsc'
import { streamText } from 'ai'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { updateInterviewMessagesAction } from '@/app/interviews/[interviewId]/_actions/update-interview-messages-action'
import type { TextContent } from '@/drizzle/schema/interview-schema'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

export const continueConversationAction = async (id: string, history: TextContent[]) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const stream = createStreamableValue<string, Error>()

  const messages = history.map((message) => ({
    role: message.role,
    content: message.content,
  }))

  ;(async () => {
    const { textStream } = streamText({
      model: openai('gpt-5-chat-latest'),
      messages: messages,
    })

    let newMessage = ''
    for await (const text of textStream) {
      newMessage += text
      stream.update(text)
    }

    const updatedMessages = [
      ...history,
      {
        type: 'text',
        id: crypto.randomUUID(),
        role: 'assistant',
        content: newMessage,
        createdAt: new Date(),
      },
    ] satisfies TextContent[]
    await updateInterviewMessagesAction(id, updatedMessages)

    stream.done()
  })()

  return {
    messages: history,
    newMessage: stream.value,
  }
}
