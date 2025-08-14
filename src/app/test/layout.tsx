import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Virtual Keyboard Test',
  description: 'Test page for virtual keyboard functionality',
}

export default function TestLayout({ children }: { children: ReactNode }) {
  return children
}