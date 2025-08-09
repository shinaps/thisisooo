'use client'

import { useState } from 'react'
import { generateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/generate-article-action'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'

type Props = {
  interviewId: string
}
export const GenerateArticleButton = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const handleClickGenerateArticle = async () => {
    setIsLoading(true)
    try {
      await generateArticleAction(props.interviewId)
    } catch (e) {
      console.error('記事生成に失敗しました:', e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <Button type="button" onClick={handleClickGenerateArticle}>
        記事を生成する
      </Button>
    </>
  )
}
