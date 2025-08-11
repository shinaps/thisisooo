'use client'

import DOMPurify from 'dompurify'
import markdownit from 'markdown-it'
import { useEffect, useState } from 'react'

type Props = {
  article: {
    title: string | null
    content: string | null
    published: boolean
    status: number
    interviewId: string
    authorId: string
    createdAt: Date
    userDisplayName: string | null
  }
}
export const Article = (props: Props) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const date = new Date(props.article.createdAt)
  const formattedDateTime = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

  const md = markdownit()
  const dirtyHtml = md.render(props.article.content || '')
  const cleanHtml = DOMPurify.sanitize(dirtyHtml)

  return (
    <div className="flex flex-col grow">
      <h1 className="text-2xl font-bold mt-4 mb-3 px-4">{props.article.title}</h1>
      <div className="flex justify-between w-full gap-x-4 px-4 mb-4 border-b pb-3">
        <span className="truncate">{props.article.userDisplayName}</span>
        <span className="shrink-0">{formattedDateTime}</span>
      </div>
      {/** biome-ignore lint/security/noDangerouslySetInnerHtml: ok */}
      <div className="markdown-body px-4 pb-28" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  )
}
