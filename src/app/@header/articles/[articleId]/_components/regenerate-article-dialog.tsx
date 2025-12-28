'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { regenerateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/regenerate-article-action'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ARTICLE_TONE, type ArticleTone } from '@/drizzle/schema/d1/article-schema'

type Props = {
  interviewId: string
  articleId: string
  currentTone: ArticleTone
  currentCustomInstruction: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const RegenerateArticleDialog = (props: Props) => {
  const router = useRouter()
  const [tone, setTone] = useState<ArticleTone>(props.currentTone)
  const [customInstruction, setCustomInstruction] = useState(props.currentCustomInstruction ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await regenerateArticleAction(props.interviewId, props.articleId, tone, customInstruction.trim() || null)
      router.refresh()
    } catch (e) {
      console.error('記事の再生成に失敗しました:', e)
    } finally {
      setIsLoading(false)
      props.onOpenChange(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>記事を再生成</DialogTitle>
            <DialogDescription>記事のスタイルを選んで再生成します。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <RadioGroup value={tone} onValueChange={(value) => setTone(value as ArticleTone)}>
              <Label htmlFor="regenerate-interview" className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer">
                <RadioGroupItem value={ARTICLE_TONE.INTERVIEW} id="regenerate-interview" />
                <div className="space-y-1 leading-none">
                  <span className="font-medium">インタビュー記事</span>
                  <p className="text-sm text-muted-foreground">質問と回答の形式で、臨場感のある対話形式のインタビュー記事を生成します。</p>
                </div>
              </Label>
              <Label htmlFor="regenerate-blog" className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer">
                <RadioGroupItem value={ARTICLE_TONE.BLOG} id="regenerate-blog" />
                <div className="space-y-1 leading-none">
                  <span className="font-medium">ブログ記事</span>
                  <p className="text-sm text-muted-foreground">回答者の視点で、自然な語り口調のブログ記事を生成します。</p>
                </div>
              </Label>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="regenerate-custom-instruction" className="text-sm font-medium">
                カスタム指示（任意）
              </Label>
              <Textarea
                id="regenerate-custom-instruction"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="例: 「ですます調で書いてください」「専門用語には説明を付けてください」"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">記事生成時に考慮してほしい追加の指示を入力できます。</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              再生成する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
