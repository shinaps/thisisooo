'use client'

import { useState } from 'react'
import { updateArticlePublishStateAction } from '@/app/@header/articles/[articleId]/_actions/update-article-publish-state-action'
import { Button } from '@/components/ui/button'
import type { SelectArticle } from '@/drizzle/schema/d1/article-schema'

type Props = {
  article: SelectArticle
}
export const ArticleActions = (props: Props) => {
  const [isPublished, setIsPublished] = useState<boolean>(props.article.published)

  const handleClickPublish = async () => {
    const updatedPublished = await updateArticlePublishStateAction(props.article.id, true)
    setIsPublished(updatedPublished)
  }

  const handleClickUnpublish = async () => {
    const updatedPublished = await updateArticlePublishStateAction(props.article.id, false)
    setIsPublished(updatedPublished)
  }

  if (isPublished) {
    return (
      <Button onClick={handleClickUnpublish} variant="secondary">
        記事を非公開にする
      </Button>
    )
  }
  return <Button onClick={handleClickPublish}>記事を公開する</Button>
}
