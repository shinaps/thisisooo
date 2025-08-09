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

export default function RootLayout(props: { children: ReactNode; header: ReactNode }) {
  return (
    <html lang="ja">
      <body
        className={cn(geistSans.variable, geistMono.variable, 'antialiased bg-background min-h-dvh flex flex-col')} //
        style={{ overscrollBehavior: 'none', overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'auto', touchAction: 'none' }}
      >
        <header className="max-w-md mx-auto w-full sticky top-0 z-50 border-b bg-background">{props.header}</header>
        <main className="w-full max-w-md mx-auto flex flex-col grow overflow-y-scroll scrollbar-none">{props.children}</main>
      </body>
    </html>
  )
}
