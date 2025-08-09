'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getArticleStatusAction } from '@/app/articles/[articleId]/_actions/get-article-status-action'
import { Loader } from '@/components/ui/loader'
import { ARTICLE_STATUS, type ArticleStatus } from '@/drizzle/schema/article-schema'

type Props = { articleId: string; initialStatus: ArticleStatus }
export const WaitForArticle = (props: Props) => {
  const { articleId, initialStatus } = props

  const router = useRouter()
  const [status, setStatus] = useState<ArticleStatus>(initialStatus)

  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const intervalMs = useRef(10000)
  const stopped = useRef(false)

  // 最新の tick を参照するための ref
  const tickRef = useRef<() => Promise<void>>(async () => {})

  const tick = useCallback(async () => {
    try {
      const next = await getArticleStatusAction(articleId)
      setStatus(next)

      if (next === ARTICLE_STATUS.COMPLETED) {
        stopped.current = true
        if (timer.current) {
          clearInterval(timer.current)
          timer.current = null
        }
        router.refresh()
      }
    } catch {
      // 一時エラーは無視。必要なら指数バックオフやJitterに変更
    }
  }, [articleId, router])

  // 常に最新の tick を呼べるように
  useEffect(() => {
    tickRef.current = tick
  }, [tick])

  useEffect(() => {
    const start = () => {
      if (!timer.current && !stopped.current && !document.hidden) {
        timer.current = setInterval(() => {
          // 常に最新の tick を呼ぶ
          tickRef.current()
        }, intervalMs.current)
      }
    }

    const stop = () => {
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    const onPageShow = () => start() // BFCache 復元や redirect 後に再開
    const onPageHide = () => stop()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('pagehide', onPageHide)

    // マウント直後に確実に開始し、即時 tick を1回打つ
    start()
    void tickRef.current()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('pagehide', onPageHide)
      stop()
    }
  }, [])

  if (status === ARTICLE_STATUS.INIT || status === ARTICLE_STATUS.IN_PROGRESS) {
    return <Loader />
  }

  // COMPLETED の場合は router.refresh() が走る前提。必要ならフォールバックUIを返す
  return null
}
