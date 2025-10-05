import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default function HeaderLoading() {
  return (
    <div className="mx-auto max-w-screen-lg h-16 flex items-center justify-between px-4">
      <Link href="/" className="font-semibold">
        this is ◯◯◯
      </Link>
      <div className="flex items-center gap-x-4">
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  )
}
