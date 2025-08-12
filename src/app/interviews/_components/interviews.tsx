'use client'

import { Trash } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteInterviewAction } from '@/app/interviews/_actions/delete-interview-action'
import { type InterviewTheme, initInterviewAction } from '@/app/interviews/_actions/init-interview-action'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'

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
  const router = useRouter()
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

  const handleDeleteInterview = async (interviewId: string) => {
    setIsLoading(true)
    try {
      await deleteInterviewAction(interviewId)
    } catch (error) {
      console.error('インタビューの削除に失敗しました:', error)
      // エラーハンドリングを追加することもできます
    } finally {
      router.refresh()
      setIsLoading(false)
    }
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
            const date = new Date(interview.createdAt)
            const formattedDateTime = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

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
                      <span>{formattedDateTime}</span>
                      <Button
                        type="button" //
                        onClick={(e) => {
                          e.preventDefault()
                          ConfirmDialog.call({
                            title: 'インタビューの削除',
                            description: 'インタビューを削除しますか？インタビューを削除すると生成済みの記事も削除されます。',
                            onConfirm: {
                              text: '削除する',
                              variant: 'destructive',
                              onClick: async () => {
                                await handleDeleteInterview(interview.id)
                              },
                            },
                          })
                        }}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash />
                      </Button>
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
