'use client'

import type { ReactNode } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'

export const Providers = (props: { children: ReactNode }) => {
  return (
    <>
      <ConfirmDialog.Root />
      {props.children}
    </>
  )
}
