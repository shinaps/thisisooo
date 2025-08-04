import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type Props = {
  useBackGround?: boolean
}
export const Loader = (props: Props) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return createPortal(
    <div
      className={cn(
        'fixed top-0 z-50 flex h-dvh w-dvw items-center justify-center', //
        props.useBackGround ? 'bg-background' : 'bg-transparent',
      )}
    >
      <div className="flex h-36 w-36 items-center justify-center rounded-md bg-muted-foreground/70">
        <LoaderCircle size={48} className="animate-spin text-muted" />
      </div>
    </div>,
    document.body,
  )
}
