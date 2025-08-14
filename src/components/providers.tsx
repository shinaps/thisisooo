'use client'

import type { ReactNode } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Toaster } from '@/components/ui/sonner'

export const Providers = (props: { children: ReactNode }) => {
  return (
    <>
      <ConfirmDialog.Root />
      {props.children}
      <Toaster position="top-center" />
    </>
  )
}
