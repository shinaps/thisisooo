'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  stream: MediaStream | null
  variant?: 'waveform' | 'bars'
  className?: string
}

export const Visualizer = ({ stream, variant = 'waveform', className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  useEffect(() => {
    if (!stream || !canvasRef.current) return

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
      latencyHint: 'interactive',
    })
    audioCtxRef.current = audioCtx

    const source = audioCtx.createMediaStreamSource(stream)
    sourceRef.current = source

    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.85
    analyserRef.current = analyser
    source.connect(analyser)

    const canvas = canvasRef.current
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const resize = () => {
      const { clientWidth, clientHeight } = canvas
      canvas.width = Math.floor(clientWidth * dpr)
      canvas.height = Math.floor(clientHeight * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const ctx = canvas.getContext('2d')!
    dataRef.current = new Uint8Array(analyser.frequencyBinCount * 2)

    const draw = () => {
      if (!analyserRef.current || !dataRef.current) return

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      if (variant === 'bars') {
        const freq = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(freq)

        let sum = 0
        for (let i = 0; i < freq.length; i++) sum += freq[i] * freq[i]
        const rms = Math.sqrt(sum / freq.length) / 255

        const barCount = 48
        const step = Math.floor(freq.length / barCount)
        const barW = (w / barCount) * 0.72

        ctx.fillStyle = getComputedStyle(canvas).color || '#0f172a'
        for (let i = 0; i < barCount; i++) {
          const v = freq[i * step] / 255
          const bh = v * h
          const x = i * (w / barCount) + (w / barCount - barW) / 2
          ctx.globalAlpha = 0.9
          ctx.fillRect(x, h - bh, barW, bh)
        }
        ctx.globalAlpha = 1
        ctx.fillRect(0, h - Math.max(2, h * 0.015), w * Math.min(1, rms * 1.5), Math.max(2, h * 0.015))
      } else {
        const buffer = dataRef.current!
        analyserRef.current.getByteTimeDomainData(buffer)
        ctx.beginPath()
        ctx.lineWidth = Math.max(2, Math.round(w / 600))
        ctx.strokeStyle = getComputedStyle(canvas).color || '#0f172a'

        const slice = w / buffer.length
        for (let i = 0; i < buffer.length; i++) {
          const v = buffer[i] / 128 - 1 // -1..1
          const y = h / 2 + v * (h * 0.45)
          const x = i * slice
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
    animRef.current = requestAnimationFrame(draw)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      ro.disconnect()
      try {
        sourceRef.current?.disconnect()
      } catch {}
      try {
        analyserRef.current?.disconnect()
      } catch {}
      if (audioCtxRef.current?.state !== 'closed') {
        audioCtxRef.current?.close().catch(() => {})
      }
      analyserRef.current = null
      sourceRef.current = null
      audioCtxRef.current = null
      dataRef.current = null
    }
  }, [stream, variant])

  return (
    <div
      className={cn(
        'w-full h-9 overflow-hidden',
        'text-neutral-900 dark:text-neutral-100', // canvas の線色に同調
        className,
      )}
    >
      <canvas className="w-full h-full block" ref={canvasRef} />
    </div>
  )
}
