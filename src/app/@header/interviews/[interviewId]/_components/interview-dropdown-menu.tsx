'use client'

import { Ellipsis, RefreshCcw, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteInterviewAction } from '@/app/@header/interviews/[interviewId]/_actions/delete-interview-action'
import { RegenerateArticleDialog } from '@/app/@header/articles/[articleId]/_components/regenerate-article-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Loader } from '@/components/ui/loader'
import type { ArticleTone } from '@/drizzle/schema/d1/article-schema'

type Props = {
  interviewId: string
  articleInfo: {
    id: string
    tone: ArticleTone
    customInstruction: string | null
  } | null
}
export const InterviewDropdownMenu = (props: Props) => {
  const { interviewId, articleInfo } = props

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)

  const deleteInterview = async (interviewId: string) => {
    setIsLoading(true)
    try {
      await deleteInterviewAction(interviewId)
    } catch (error) {
      console.error('インタビューの削除に失敗しました:', error)
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

  return (
    <>
      {isLoading && <Loader />}
      {articleInfo && (
        <RegenerateArticleDialog
          interviewId={interviewId}
          articleId={articleInfo.id}
          currentTone={articleInfo.tone}
          currentCustomInstruction={articleInfo.customInstruction}
          open={regenerateDialogOpen}
          onOpenChange={setRegenerateDialogOpen}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {articleInfo && (
            <>
              <DropdownMenuItem onClick={() => setRegenerateDialogOpen(true)}>
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
