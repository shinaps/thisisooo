'use server'

import { generateObject } from 'ai'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/drizzle/client'
import { interview, type TextContent } from '@/drizzle/schema/interview-schema'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

const generateContext = (messages: TextContent[]) => {
  let context = ''

  context += '以下のインタビューに関して、インタビューが完了しているかどうかを判定してbooleanで回答してください。\n'
  context += 'インタビューが完了している状態というのは、Assistantが明示的にインタビューのクロージングのようなことを言っているかどうかということで判別します。\n\n'

  for (const message of messages) {
    if (message.role === 'user') {
      context += `User: ${message.content}\n`
    } else if (message.role === 'assistant') {
      context += `Assistant: ${message.content}\n`
    }
  }

  return context
}

const updateInterviewCompleted = async (id: string, isCompleted: boolean) => {
  try {
    const [updatedInterview] = await db //
      .update(interview)
      .set({ completed: isCompleted })
      .where(eq(interview.id, id))
      .returning()

    return updatedInterview
  } catch (error) {
    console.error('Error updating interview completion status:', error)
    return null
  }
}

export const detectInterviewCompletedAction = async (id: string, messages: TextContent[]) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const context = generateContext(messages)

  const { object } = await generateObject({
    model: openai('gpt-5-nano'),
    schema: z.object({
      isCompleted: z.boolean(),
    }),
    prompt: context,
  })

  const isCompleted = object.isCompleted
  await updateInterviewCompleted(id, isCompleted)

  return isCompleted
}
