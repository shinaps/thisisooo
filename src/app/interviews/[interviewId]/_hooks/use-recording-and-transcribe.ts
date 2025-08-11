'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { transcribeAction } from '@/app/interviews/[interviewId]/_actions/transcribe-action'
import type { TextContent } from '@/drizzle/schema/interview-schema'

type UseRecOptions = {
  maxDurationMs?: number // 録音の自動停止上限（デフォ 5分）
  sizeLimitBytes?: number // 送信前サイズ上限（デフォ 25MB）
  preferredMimeTypes?: string[] // 優先する MIME（フォールバック順）
  model?: string // "gpt-4o-transcribe" | "whisper-1" など
}

export type TranscribeSegment = { start?: number; end?: number; text: string }

export const useRecordingAndTranscribe = (messages: TextContent[], opts: UseRecOptions = {}) => {
  const { maxDurationMs = 5 * 60 * 1000, sizeLimitBytes = 25 * 1024 * 1024, preferredMimeTypes = ['audio/webm;codecs=opus', 'audio/mp4'], model = 'gpt-4o-transcribe' } = opts

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const [segments, setSegments] = useState<TranscribeSegment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timeoutRef = useRef<number | null>(null)

  const pickMime = useCallback(() => {
    for (const mt of preferredMimeTypes) {
      if (MediaRecorder.isTypeSupported(mt)) return mt
    }
    return '' // UA に任せる
  }, [preferredMimeTypes])

  const startRecording = useCallback(async () => {
    setError(null)
    setTranscribedText('')
    setSegments([])

    const s = await navigator.mediaDevices.getUserMedia({ audio: true })
    setStream(s)

    const mime = pickMime()
    const mr = new MediaRecorder(s, mime ? { mimeType: mime } : undefined)
    chunksRef.current = []

    mr.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data)
    }

    mr.onstart = () => {
      if (maxDurationMs > 0) {
        timeoutRef.current = window.setTimeout(() => {
          try {
            mr.stop()
          } catch {}
        }, maxDurationMs)
      }
    }

    mr.start() // timeslice 無し → 停止後にまとめて転写
    mediaRecorderRef.current = mr
    setIsRecording(true)
  }, [maxDurationMs, pickMime])

  const stopRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current
    if (!mr) return

    const finalize = async () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      const type = mr.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type })

      // サイズ上限チェック
      if (blob.size > sizeLimitBytes) {
        setError(`録音が長すぎます（${Math.round(sizeLimitBytes / (1024 * 1024))}MB超）。短めに録音してください。`)
        setStream(null)
        mr.stream.getTracks().forEach((t) => t.stop())
        setIsRecording(false)
        return
      }

      const fileName = type.includes('mp4') ? 'recording.m4a' : 'recording.webm'
      const file = new File([blob], fileName, { type })
      const fd = new FormData()
      fd.append('file', file)
      fd.append('model', model)

      setIsTranscribing(true)
      try {
        const res = await transcribeAction(fd, messages)
        setTranscribedText(res.text ?? '')
        setSegments((res.segments ?? []) as TranscribeSegment[])
      } catch (e: any) {
        setError(e?.message ?? '転写に失敗しました')
      } finally {
        setIsTranscribing(false)
      }

      setStream(null)
      mr.stream.getTracks().forEach((t) => t.stop())
    }

    mr.onstop = finalize
    mr.stop()
    setIsRecording(false)
  }, [model, sizeLimitBytes, messages])

  const cancelRecording = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr) return

    // タイマー解除
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    try {
      mr.onstop = () => {
        setStream(null)
        mr.stream.getTracks().forEach((t) => t.stop())
      }
      mr.stop()
    } catch {}

    // 状態リセット
    chunksRef.current = []
    setIsRecording(false)
    setIsTranscribing(false)
    setTranscribedText('')
    setSegments([])
  }, [])

  const resetRecording = useCallback(() => {
    setTranscribedText('')
    setSegments([])
    setError(null)
  }, [])

  // アンマウント時の掃除
  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop()
      } catch {}
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    // 操作
    startRecording,
    stopRecording,
    resetRecording,
    cancelRecording,

    // 状態
    isRecording,
    isTranscribing,
    error,

    // 結果
    transcribedText,
    segments,

    // 可視化などで使う用
    stream,
  }
}
