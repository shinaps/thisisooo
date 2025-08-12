'use client'

import { Ellipsis, RefreshCcw, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteInterviewAction } from '@/app/@header/interviews/[interviewId]/_actions/delete-interview-action'
import { regenerateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/regenerate-article-action'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Loader } from '@/components/ui/loader'

type Props = {
  interviewId: string
  articleId: string | null
}
export const InterviewDropdownMenu = (props: Props) => {
  const { interviewId, articleId } = props

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const deleteInterview = async (interviewId: string) => {
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

  const handleClickDelete = (interviewId: string) => {
    ConfirmDialog.call({
      title: 'インタビューの削除',
      description: 'インタビューを削除しますか？インタビューを削除すると生成済みの記事も削除されます。',
      onConfirm: {
        text: '削除する',
        variant: 'destructive',
        onClick: async () => {
          await deleteInterview(interviewId)
        },
      },
    })
  }

  const regenerateArticle = async (interviewId: string, articleId: string) => {
    setIsLoading(true)
    try {
      await regenerateArticleAction(interviewId, articleId)
    } catch (e) {
      console.error('記事の再生成に失敗しました:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClickRegenerateArticle = (interviewId: string, articleId: string) => {
    ConfirmDialog.call({
      title: '記事を再生成しますか？',
      description: 'この記事を再生成します。よろしいですか？',
      onConfirm: {
        text: '再生成する',
        variant: 'default',
        onClick: async () => {
          await regenerateArticle(interviewId, articleId)
        },
      },
    })
  }

  return (
    <>
      {isLoading && <Loader />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {articleId && (
            <>
              <DropdownMenuItem onClick={() => handleClickRegenerateArticle(interviewId, articleId)}>
                <RefreshCcw />
                記事を再生成する
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            variant="destructive" //
            onClick={() => handleClickDelete(interviewId)}
          >
            <Trash />
            削除する
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
