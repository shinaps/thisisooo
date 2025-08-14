'use client'

import { useEffect, useRef, useState } from 'react'
import { useVirtualKeyboard } from '../interviews/[interviewId]/_hooks/use-virtual-keyboard'
import { Textarea } from '../../components/ui/textarea'
import { cn } from '../../lib/utils'

export default function TestPage() {
  const [input, setInput] = useState<string>('')
  const [textareaHeight, setTextareaHeight] = useState<number>(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { keyboardHeight } = useVirtualKeyboard()

  useEffect(() => {
    if (textareaRef.current) {
      // 高さの自動調整
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${scrollHeight}px`
      setTextareaHeight(scrollHeight)
    }
  }, [input])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-col w-full items-center justify-between pb-4 px-4 grow gap-y-2">
        <div
          className="flex flex-col w-full gap-y-4 pt-2"
          style={{
            paddingBottom: `${94 + textareaHeight + keyboardHeight}px`,
          }}
        >
          <div className="bg-gray-100 p-4 rounded-lg">
            <h1 className="text-lg font-bold mb-2">仮想キーボードテスト</h1>
            <p className="text-sm text-gray-600 mb-2">
              キーボード高さ: {keyboardHeight}px
            </p>
            <p className="text-sm text-gray-600">
              下のテキストエリアをタップして、仮想キーボードが表示された時にテキストエリアが隠れないことを確認してください。
            </p>
          </div>
          
          {/* ダミーコンテンツでスクロールを作る */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-blue-50 p-4 rounded-lg">
              <p>テストメッセージ {i + 1}</p>
              <p className="text-sm text-gray-500">
                これは仮想キーボードのテストのためのダミーコンテンツです。
              </p>
            </div>
          ))}
        </div>
        
        {/* 固定されたテキストエリア */}
        <div 
          className={cn("w-full fixed z-50 bg-background keyboard-aware-bottom")} 
          style={{ bottom: `${keyboardHeight}px` }}
        >
          <div className="p-4">
            <div className={cn('max-w-3xl w-full border rounded-md p-2 flex flex-col')}>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ここにテキストを入力してください..."
                className="border-none resize-none focus-visible:ring-0 min-h-auto rounded-none shadow-none"
                rows={1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}