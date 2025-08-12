'use client'

import Link from 'next/link'
import { useState } from 'react'
import { type InterviewTheme, initInterviewAction } from '@/app/interviews/_actions/init-interview-action'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { formatDate } from '@/lib/utils'

type Props = {
  interviews: {
    id: string
    title: string
    createdAt: Date
    theme: string
    articleId: string | null
  }[]
}
export const Interviews = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleInitInterview = async (type: InterviewTheme) => {
    setIsLoading(true)
    try {
      await initInterviewAction(type)
    } catch (error) {
      console.error('インタビューの初期化に失敗しました:', error)
      // エラーハンドリングを追加することもできます
    } finally {
      setIsLoading(false)
    }
  }

  if (props.interviews.length === 0) {
    return (
      <>
        {isLoading && <Loader />}
        <div className="flex flex-col items-center px-4 justify-center grow">
          <div className="flex flex-col gap-y-8">
            <span className="text-lg font-semibold text-center">記事を作成しましょう！</span>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleInitInterview('career')}>キャリア</Button>
              <Button onClick={() => handleInitInterview('recentEffort')}>直近の頑張り</Button>
              <Button onClick={() => handleInitInterview('favoriteArtist')}>好きなアーティスト</Button>
              <Button onClick={() => handleInitInterview('hobby')}>趣味</Button>
              <Button onClick={() => handleInitInterview('favoriteBook')}>好きな本</Button>
              <Button onClick={() => handleInitInterview('favoriteMovie')}>好きな映画</Button>
              <Button onClick={() => handleInitInterview('favoriteGame')}>好きなゲーム</Button>
              <Button onClick={() => handleInitInterview('recentRestaurant')}>最近行った飲食店</Button>
              <Button onClick={() => handleInitInterview('selfIntroduction')}>自己紹介</Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col px-4 py-8 gap-y-8">
        <div className="flex flex-col gap-y-2">
          <span className="text-lg font-semibold">記事を作成する</span>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleInitInterview('career')}>キャリア</Button>
            <Button onClick={() => handleInitInterview('recentEffort')}>直近の頑張り</Button>
            <Button onClick={() => handleInitInterview('favoriteArtist')}>好きなアーティスト</Button>
            <Button onClick={() => handleInitInterview('hobby')}>趣味</Button>
            <Button onClick={() => handleInitInterview('favoriteBook')}>好きな本</Button>
            <Button onClick={() => handleInitInterview('favoriteMovie')}>好きな映画</Button>
            <Button onClick={() => handleInitInterview('favoriteGame')}>好きなゲーム</Button>
            <Button onClick={() => handleInitInterview('selfIntroduction')}>自己紹介</Button>
          </div>
        </div>
        <div className="w-full items-center flex flex-col gap-y-4">
          {props.interviews.map((interview) => {
            return (
              <Link href={`/interviews/${interview.id}`} key={interview.id} className="w-full">
                <Card>
                  <CardHeader className="gap-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="w-fit">this is 私の{interview.theme}</Badge>
                      {interview.articleId && (
                        <Badge variant="outline" className="w-fit">
                          記事生成済み
                        </Badge>
                      )}
                    </div>
                    <CardTitle>{interview.title}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <div className="flex items-center justify-between w-full">
                      <span>{formatDate(interview.createdAt)}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
