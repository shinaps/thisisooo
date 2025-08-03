import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'this is ◯◯◯',
  description: 'this is app for ◯◯◯',
}

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased bg-background')}>
        <div className="w-full max-w-md min-h-screen mx-auto flex flex-col border">{props.children}</div>
      </body>
    </html>
  )
}
