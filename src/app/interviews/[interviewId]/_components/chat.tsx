'use client'

import { readStreamableValue } from '@ai-sdk/rsc'
import { Circle, LoaderCircle, Mic, RefreshCcw, Send, WandSparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { continueConversationAction } from '@/app/interviews/[interviewId]/_actions/continue-conversation-action'
import { detectInterviewCompletedAction } from '@/app/interviews/[interviewId]/_actions/detect-interview-completed-action'
import { Visualizer } from '@/app/interviews/[interviewId]/_components/visualizer'
import { useNormalizeText } from '@/app/interviews/[interviewId]/_hooks/use-normalize-text'
import { useRecordingAndTranscribe } from '@/app/interviews/[interviewId]/_hooks/use-recording-and-transcribe'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { TextContent } from '@/drizzle/schema/interview-schema'
import { cn } from '@/lib/utils'

type Props = {
  interviewId: string
  isCompleted: boolean
  initialMessages: TextContent[]
}
export const Chat = ({ interviewId, isCompleted, initialMessages }: Props) => {
  const router = useRouter()
  const initialMessageProceed = useRef(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [conversation, setConversation] = useState<TextContent[]>(initialMessages)
  const [input, setInput] = useState<string>('')
  const [textareaHeight, setTextareaHeight] = useState<number>(0)
  const [isJudgingInterviewCompleted, setIsJudgingInterviewCompleted] = useState<boolean>(false)
  const [isInterviewCompleted, setIsInterviewCompleted] = useState<boolean>(isCompleted)

  const {
    isRecording, //
    stream,
    transcribedText,
    startRecording,
    stopRecording,
    cancelRecording,
    isTranscribing,
  } = useRecordingAndTranscribe(conversation, {
    maxDurationMs: 5 * 60 * 1000,
    sizeLimitBytes: 5 * 1024 * 1024,
  })

  const { isNormalizing, normalizeText } = useNormalizeText()

  useEffect(() => {
    if (initialMessageProceed.current) return

    if (initialMessages.at(-1)?.role === 'system') {
      sendMessage(initialMessages)
      initialMessageProceed.current = true
    }

    if (initialMessages.at(-1)?.role === 'assistant') {
      setIsJudgingInterviewCompleted(true)
    }
  }, [])

  useEffect(() => {
    if (!isJudgingInterviewCompleted) return
    if (conversation.at(-1)?.role !== 'assistant' || isInterviewCompleted) {
      setIsJudgingInterviewCompleted(false)
      return
    }

    detectInterviewCompletedAction(interviewId, conversation).then((isCompleted) => {
      const changeToCompleted = isCompleted && !isInterviewCompleted
      if (changeToCompleted) {
        router.refresh()
      }

      setIsInterviewCompleted(isCompleted)
      setIsJudgingInterviewCompleted(false)
    })
  }, [isJudgingInterviewCompleted])

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [conversation, input, isInterviewCompleted])

  useEffect(() => {
    if (textareaRef.current) {
      // 高さの自動調整
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${scrollHeight}px`
      setTextareaHeight(scrollHeight)
    }
  }, [input])

  useEffect(() => {
    if (transcribedText.trim() !== '') {
      const newInput = `${input}${transcribedText}`
      setInput(newInput)
    }
  }, [transcribedText])

  const sendMessage = async (inputMessages: TextContent[]) => {
    const { messages, newMessage } = await continueConversationAction(interviewId, inputMessages)
    setConversation(messages)

    let textContent = ''
    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`
      setConversation([
        ...messages,
        {
          type: 'text',
          id: crypto.randomUUID(),
          role: 'assistant',
          content: textContent,
          createdAt: new Date(),
        },
      ])
    }

    setIsJudgingInterviewCompleted(true)
  }

  const handleClickSend = async () => {
    if (input.trim() === '') {
      return
    }
    setInput('')
    const newMessages = [
      ...conversation,
      {
        type: 'text',
        id: crypto.randomUUID(),
        role: 'user',
        content: input,
        createdAt: new Date(),
      },
    ] satisfies TextContent[]
    await sendMessage(newMessages)
  }

  // 対象のメッセージ以降のメッセージを削除して再送信する
  const handleClickRefresh = async (contentId: string) => {
    const index = conversation.findIndex((message) => message.id === contentId)
    if (index === -1) {
      return
    }

    setInput('')
    // 対象のメッセージ以降のメッセージを削除して再送信
    const messagesToResend = conversation.slice(0, index)
    setConversation(messagesToResend)
    await sendMessage(messagesToResend)
  }

  const handleClickWindSparkles = async () => {
    const normalizedText = await normalizeText(conversation, input)
    setInput(normalizedText)
  }

  const isLoading = isNormalizing || isTranscribing

  return (
    <div className="flex flex-col w-full items-center justify-between pb-4 px-4 grow gap-y-2">
      <div
        className="flex flex-col w-full gap-y-4 pt-2"
        style={{
          paddingBottom: `${94 + textareaHeight}px`,
        }}
      >
        {conversation.map((message, index) => {
          if (message.role === 'system') {
            return null
          }

          if (message.role === 'user') {
            return (
              <div key={index} className={cn('whitespace-pre-line max-w-3/4 self-end bg-secondary rounded-lg p-2')}>
                {message.content}
              </div>
            )
          }

          return (
            <div key={index} className={cn('whitespace-pre-line self-start relative pb-6')}>
              <span>{message.content}</span>
              <Button
                onClick={() => {
                  ConfirmDialog.call({
                    title: '再実行の確認',
                    description: 'このメッセージを再生成しますか？',
                    onConfirm: {
                      text: '再生成する',
                      variant: 'default',
                      onClick: async () => {
                        await handleClickRefresh(message.id)
                      },
                    },
                  })
                }} //
                size="icon"
                variant="ghost"
                className="absolute size-5 -bottom-0 left-0 rounded-none"
              >
                <RefreshCcw className="size-3" />
              </Button>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="w-full fixed bottom-0 p-4 z-50 bg-background">
        {!isInterviewCompleted && (
          <div className={cn('max-w-3xl w-full border rounded-md p-2 flex flex-col')}>
            {isRecording ? (
              <Visualizer stream={stream} />
            ) : (
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here."
                className="border-none resize-none focus-visible:ring-0 min-h-auto rounded-none shadow-none"
                rows={1}
                disabled={isLoading}
              />
            )}

            <div className="flex gap-x-2 self-end">
              {isRecording && (
                <>
                  <Button
                    size="icon" //
                    variant="ghost"
                    onClick={cancelRecording}
                  >
                    <X />
                  </Button>
                  <Button
                    size="icon" //
                    variant="ghost"
                    onClick={stopRecording}
                  >
                    <Circle className="fill-red-600 text-red-600" />
                  </Button>
                </>
              )}

              {isLoading && (
                <Button
                  size="icon" //
                  variant="ghost"
                  disabled
                >
                  <LoaderCircle className="animate-spin" />
                </Button>
              )}

              {!isLoading && !isRecording && (
                <>
                  {input.trim() !== '' && (
                    <Button
                      size="icon" //
                      variant="ghost"
                      onClick={handleClickWindSparkles}
                    >
                      <WandSparkles />
                    </Button>
                  )}

                  <Button
                    size="icon" //
                    variant="ghost"
                    onClick={startRecording}
                  >
                    <Mic />
                  </Button>
                  <Button
                    size="icon" //
                    variant="ghost"
                    onClick={handleClickSend}
                  >
                    <Send />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
