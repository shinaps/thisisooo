'use client'

import DOMPurify from 'dompurify'
import markdownit from 'markdown-it'
import { useEffect, useState } from 'react'
import { continueGenerateArticleAction } from '@/app/articles/[articleId]/_actions/continue-generate-article-action'
import { ARTICLE_STATUS } from '@/drizzle/schema/d1/article-schema'
import { formatDate } from '@/lib/utils'

type Props = {
  article: {
    id: string
    title: string | null
    content: string | null
    status: number
    createdAt: Date
    interviewId: string
    userDisplayName: string | null
  }
}
export const Article = (props: Props) => {
  const [title, setTitle] = useState(props.article.title || 'Loading...')
  const [content, setContent] = useState(props.article.content || '')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (props.article.status === ARTICLE_STATUS.INIT) {
      continueGenerateArticleAction(props.article.interviewId, props.article.id).then((result) => {
        setTitle(result.title)
        setContent(result.body)
      })
    }
  }, [])

  if (!isMounted) {
    return null
  }

  const md = markdownit()
  const dirtyHtml = md.render(content || '')
  const cleanHtml = DOMPurify.sanitize(dirtyHtml)

  return (
    <div className="flex flex-col grow">
      <h1 className="text-2xl font-bold mt-4 mb-3 px-4">{title}</h1>
      <div className="flex justify-between w-full gap-x-4 px-4 mb-4 border-b pb-3">
        <span className="truncate">{props.article.userDisplayName}</span>
        <span className="shrink-0">{formatDate(props.article.createdAt)}</span>
      </div>
      {/** biome-ignore lint/security/noDangerouslySetInnerHtml: ok */}
      <div className="markdown-body px-4 pb-28" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  )
}
