import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Chat } from '@/app/interviews/[interviewId]/_components/chat'
import { getDb } from '@/drizzle/client'
import { interview } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'

export default async function InterviewPage({ params }: PageProps<'/interviews/[interviewId]'>) {
  const { interviewId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = getDb()
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
    redirect('/interviews')
  }

  const initialMessages = selectedInterview.content.filter((message) => message.type === 'text')

  return (
    <Chat
      interviewId={selectedInterview.id} //
      initialMessages={initialMessages}
    />
  )
}
