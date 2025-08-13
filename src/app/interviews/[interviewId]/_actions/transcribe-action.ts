'use server'

import { experimental_transcribe as transcribe } from 'ai'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { TextContent } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

const generateContext = (messages: TextContent[]) => {
  let context = ''

  context += '今までの会話を以下に示します。こちらの会話を参考に、音声を文字起こししてください。\n\n'

  for (const message of messages) {
    if (message.role === 'user') {
      context += `User: ${message.content}\n`
    } else if (message.role === 'assistant') {
      context += `Assistant: ${message.content}\n`
    }
  }

  return context
}

export const transcribeAction = async (formData: FormData, messages: TextContent[]) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const file = formData.get('file')
  if (!(file instanceof File)) throw new Error('audio file is required')

  const buf = Buffer.from(await file.arrayBuffer())
  const modelFromClient = (formData.get('model') as string) || 'gpt-4o-transcribe'

  const context = generateContext(messages)

  const result = await transcribe({
    model: openai.transcription(modelFromClient as any),
    audio: buf,
    providerOptions: {
      openai: {
        language: 'ja',
        response_format: 'verbose_json',
        temperature: 0,
        prompt: context,
      },
    },
  })

  return {
    text: result.text,
    segments: result.segments ?? [],
    duration: result.durationInSeconds ?? null,
  }
}
