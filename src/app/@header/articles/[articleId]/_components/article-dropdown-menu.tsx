'use client'

import { Ellipsis, Pencil, RefreshCcw, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteArticleAction } from '@/app/@header/articles/[articleId]/_actions/delete-article-action'
import { RegenerateArticleDialog } from '@/app/@header/articles/[articleId]/_components/regenerate-article-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Loader } from '@/components/ui/loader'
import type { ArticleTone } from '@/drizzle/schema/d1/article-schema'

type Props = {
  interviewId: string
  articleId: string
  currentTone: ArticleTone
  currentCustomInstruction: string | null
}
export const ArticleDropdownMenu = (props: Props) => {
  const { interviewId, articleId, currentTone, currentCustomInstruction } = props
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)

  const deleteArticle = async (articleId: string) => {
    setIsLoading(true)
    try {
      await deleteArticleAction(articleId)
    } catch (error) {
      console.error('インタビューの削除に失敗しました:', error)
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

  return (
    <>
      {isLoading && <Loader />}
      <RegenerateArticleDialog
        interviewId={interviewId}
        articleId={articleId}
        currentTone={currentTone}
        currentCustomInstruction={currentCustomInstruction}
        open={regenerateDialogOpen}
        onOpenChange={setRegenerateDialogOpen}
      />
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

          <DropdownMenuItem onClick={() => setRegenerateDialogOpen(true)}>
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
