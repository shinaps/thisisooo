import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getArticleIdAction } from '@/app/@header/interviews/[interviewId]/_actions/get-article-id-action'
import { GenerateArticleButton } from '@/app/@header/interviews/[interviewId]/_components/generate-article-button'
import { InterviewDropdownMenu } from '@/app/@header/interviews/[interviewId]/_components/interview-dropdown-menu'
import { Button } from '@/components/ui/button'
import { getDb } from '@/drizzle/client'
import { interview } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'

export default async function InterviewHeader({ params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = await getDb()
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

  if (articleId) {
    return (
      <div className="mx-auto max-w-screen-lg h-16 flex items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          this is ◯◯◯
        </Link>
        <div className="flex items-center gap-x-4">
          <InterviewDropdownMenu interviewId={selectedInterview.id} articleId={articleId} />
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
        <InterviewDropdownMenu interviewId={selectedInterview.id} articleId={articleId} />
        <GenerateArticleButton interviewId={selectedInterview.id} />
      </div>
    </div>
  )
}
