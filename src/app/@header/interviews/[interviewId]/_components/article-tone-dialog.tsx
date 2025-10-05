'use client'

import { useState } from 'react'
import { initGenerateArticleAction } from '@/app/@header/interviews/[interviewId]/_actions/init-generate-article-action'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ARTICLE_TONE, type ArticleTone } from '@/drizzle/schema/d1/article-schema'

type Props = {
  interviewId: string
}

export const ArticleToneDialog = (props: Props) => {
  const [open, setOpen] = useState(false)
  const [tone, setTone] = useState<ArticleTone>(ARTICLE_TONE.INTERVIEW)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await initGenerateArticleAction(props.interviewId, tone)
    } catch (e) {
      console.error('記事生成に失敗しました:', e)
    } finally {
      setIsLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button">記事を生成する</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>記事のトーンを選択</DialogTitle>
            <DialogDescription>生成する記事のスタイルを選んでください。</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={tone} onValueChange={(value) => setTone(value as ArticleTone)}>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <RadioGroupItem value={ARTICLE_TONE.INTERVIEW} id="interview" />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="interview" className="font-medium cursor-pointer">
                    インタビュー記事
                  </Label>
                  <p className="text-sm text-muted-foreground">質問と回答の形式で、臨場感のある対話形式のインタビュー記事を生成します。</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <RadioGroupItem value={ARTICLE_TONE.BLOG} id="blog" />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="blog" className="font-medium cursor-pointer">
                    ブログ記事
                  </Label>
                  <p className="text-sm text-muted-foreground">回答者の視点で、自然な語り口調のブログ記事を生成します。</p>
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              記事を生成する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
