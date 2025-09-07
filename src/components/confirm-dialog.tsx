'use client'

import { type ComponentProps, useEffect, useState } from 'react'
import { createCallable } from 'react-call'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type ConfirmDialogProps = {
  title: string
  description: string
  onConfirm: {
    text: string
    variant: ComponentProps<typeof Button>['variant']
    onClick: () => void
  }
  onCancel?: {
    text: string
    variant: ComponentProps<typeof Button>['variant']
    onClick: () => void
  }
}
export const ConfirmDialog = createCallable<ConfirmDialogProps, void>((props) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
    return () => setOpen(false)
  }, [])

  const handleClickCancel = () => {
    if (props.onCancel) {
      props.onCancel.onClick()
    }
    props.call.end()
  }

  const handleClickConfirm = () => {
    props.onConfirm.onClick()
    props.call.end()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-4">
        <DialogHeader className="p-4">
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription className="break-all">{props.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-between gap-6">
            {props.onCancel && (
              <Button onClick={handleClickCancel} className="w-full" size="lg" type="button" variant={props.onCancel.variant}>
                {props.onCancel.text}
              </Button>
            )}

            <Button onClick={handleClickConfirm} className="w-full" size="lg" type="button" variant={props.onConfirm.variant}>
              {props.onConfirm.text}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
