'use client'

import { readStreamableValue } from '@ai-sdk/rsc'
import DOMPurify from 'dompurify'
import markdownit from 'markdown-it'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { generateArticleContentAction } from '@/app/articles/[articleId]/_actions/generate-article-content-action'
import { generateArticleTitleAction } from '@/app/articles/[articleId]/_actions/generate-article-title-action'
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
    tone: 'interview' | 'blog'
  }
}
export const Article = (props: Props) => {
  const router = useRouter()
  const rendered = useRef(false)
  const [title, setTitle] = useState(props.article.title || 'Loading...')
  const [content, setContent] = useState(props.article.content || '')
  const [isMounted, setIsMounted] = useState(false)

  const interviewId = props.article.interviewId
  const articleId = props.article.id

  const generateTitle = async () => {
    const { title } = await generateArticleTitleAction(interviewId, articleId)

    let textContent = ''
    for await (const delta of readStreamableValue(title)) {
      textContent = `${textContent}${delta}`
      setTitle(textContent)
    }
  }
  const generateContent = async () => {
    const { content } = await generateArticleContentAction(interviewId, articleId, title, props.article.tone)

    let textContent = ''
    for await (const delta of readStreamableValue(content)) {
      textContent = `${textContent}${delta}`
      setContent(textContent)
    }
  }

  useEffect(() => {
    setIsMounted(true)

    if (rendered.current) return
    rendered.current = true

    if (props.article.status === ARTICLE_STATUS.INIT) {
      generateTitle()
        .then(generateContent)
        .then(() => {
          router.refresh()
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
