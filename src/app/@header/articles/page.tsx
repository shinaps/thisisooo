import { Notebook, Pencil } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'

export default async function ArticlesHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="mx-auto max-w-screen-lg h-16 flex items-center justify-between px-4">
      <Link href="/" className="font-semibold">
        this is ◯◯◯
      </Link>
      <div className="flex items-center gap-x-4">
        <Link href="/articles">
          <Button size="icon">
            <Notebook />
          </Button>
        </Link>
        <Link href="/interviews">
          <Button size="icon">
            <Pencil />
          </Button>
        </Link>
        <Link href="/profile">
          <Avatar>
            <AvatarImage src={session.user.image || ''} />
            <AvatarFallback>{session.user.name.charAt(0) || 'a'}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  )
}
