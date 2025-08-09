'use client'

import { WandSparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader } from '@/components/ui/loader'
import { Textarea } from '@/components/ui/textarea'
import type { SelectArticle } from '@/drizzle/schema/article-schema'

type Props = {
  article: SelectArticle
}
export const EditArticleDialog = (props: Props) => {
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      // 高さの自動調整
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${scrollHeight}px`
    }
  }, [input])

  return (
    <>
      {isLoading && <Loader />}
      <Dialog>
        <DialogTrigger>
          <Button size="icon" variant="ghost">
            <WandSparkles />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記事を修正しますか？</DialogTitle>
          </DialogHeader>
          <div className="w-full border rounded-md p-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="指示を入力してください。"
              className="border-none resize-none focus-visible:ring-0 min-h-auto rounded-none shadow-none"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button type="submit">実行</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
