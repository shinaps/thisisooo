'use client'

import { Ellipsis, Pencil, RefreshCcw, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteArticleAction } from '@/app/@header/articles/[articleId]/_actions/delete-article-action'
import { regenerateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/regenerate-article-action'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Loader } from '@/components/ui/loader'

type Props = {
  interviewId: string
  articleId: string
}
export const ArticleDropdownMenu = (props: Props) => {
  const { interviewId, articleId } = props
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  const deleteArticle = async (articleId: string) => {
    setIsLoading(true)
    try {
      await deleteArticleAction(articleId)
    } catch (error) {
      console.error('インタビューの削除に失敗しました:', error)
      // エラーハンドリングを追加することもできます
    } finally {
      router.refresh()
      setIsLoading(false)
    }
  }

  const handleClickDelete = (articleId: string) => {
    ConfirmDialog.call({
      title: '記事の削除',
      description: '記事を削除しますか？',
      onConfirm: {
        text: '削除する',
        variant: 'destructive',
        onClick: async () => {
          await deleteArticle(articleId)
        },
      },
    })
  }

  const regenerateArticle = async (interviewId: string, articleId: string) => {
    setIsLoading(true)
    try {
      await regenerateArticleAction(interviewId, articleId)
      router.refresh()
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
          <DropdownMenuItem onClick={() => router.push(`/interviews/${interviewId}`)}>
            <Pencil />
            インタビューを確認する
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleClickRegenerateArticle(interviewId, articleId)}>
            <RefreshCcw />
            記事を再生成する
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive" //
            onClick={() => handleClickDelete(articleId)}
          >
            <Trash />
            削除する
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
