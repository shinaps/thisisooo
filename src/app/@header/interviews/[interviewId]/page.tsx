import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { Notebook, Pencil } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getArticleIdAction } from '@/app/@header/interviews/[interviewId]/_actions/get-article-id-action'
import { GenerateArticleButton } from '@/app/@header/interviews/[interviewId]/_components/generate-article-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { db } from '@/drizzle/client'
import { interview } from '@/drizzle/schema/interview-schema'
import { auth } from '@/lib/auth'

export default async function InterviewHeader({ params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const [selectedInterview] = await db
    .select() //
    .from(interview)
    .where(
      and(
        eq(interview.id, interviewId), //
        eq(interview.authorId, session.user.id),
      ),
    )
    .limit(1)

  if (!selectedInterview) {
    return redirect('/interviews')
  }

  const articleId = await getArticleIdAction(selectedInterview.id)

  if (selectedInterview.completed) {
    if (articleId) {
      return (
        <div className="mx-auto max-w-screen-lg h-16 flex items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            this is ◯◯◯
          </Link>
          <div className="flex items-center gap-x-4">
            <Link href="/interviews">
              <Button size="icon">
                <Pencil />
              </Button>
            </Link>
            <Link href={`/articles/${articleId}`}>
              <Button type="button">記事を確認する</Button>
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
          <Link href="/interviews">
            <Button size="icon">
              <Pencil />
            </Button>
          </Link>
          <GenerateArticleButton interviewId={selectedInterview.id} />
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
