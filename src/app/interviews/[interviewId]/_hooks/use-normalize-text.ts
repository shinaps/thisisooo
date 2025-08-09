import { useState } from 'react'
import { normalizeTextAction } from '@/app/interviews/[interviewId]/_actions/normalize-text-action'
import type { TextContent } from '@/drizzle/schema/interview-schema'

export const useNormalizeText = () => {
  const [isNormalizing, setIsNormalizing] = useState(false)

  const normalizeText = async (messages: TextContent[], text: string) => {
    setIsNormalizing(true)
    try {
      return await normalizeTextAction(messages, text)
    } catch (error) {
      return text
    } finally {
      setIsNormalizing(false)
    }
  }

  return { isNormalizing, normalizeText }
}
