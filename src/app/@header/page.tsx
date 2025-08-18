import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { Github, Notebook, Pencil } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getDb } from '@/drizzle/client'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'
import { auth } from '@/lib/auth'

export default async function IndexPageHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user) {
    const db = getDb()
    const [profile] = await db
      .select() //
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1)

    return (
      <div className="mx-auto max-w-screen-lg h-16 flex items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          this is ◯◯◯
        </Link>
        <div className="flex items-center gap-x-4">
          <a href="https://github.com/shinaps/thisisooo" target="_blank" rel="noreferrer" aria-label="GitHub">
            <Button size="icon" variant="ghost">
              <Github />
            </Button>
          </a>
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
              <AvatarImage src={profile.image || ''} />
              <AvatarFallback>{profile.name.charAt(0) || ''}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-screen-lg h-16 flex items-center justify-between px-4">
      <Link href="/" className="font-semibold">
        this is ◯◯◯
      </Link>

      <div className="flex items-center gap-x-4">
        <a href="https://github.com/shinaps/thisisooo" target="_blank" rel="noreferrer" aria-label="GitHub">
          <Button size="icon" variant="ghost">
            <Github />
          </Button>
        </a>
        <Link href="/sign-in">
          <Button>ログイン</Button>
        </Link>
      </div>
    </div>
  )
}
