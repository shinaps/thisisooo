import { desc } from 'drizzle-orm'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Interviews } from '@/app/interviews/_components/interviews'
import { db } from '@/drizzle/client'
import { article } from '@/drizzle/schema/article-schema'
import { interview } from '@/drizzle/schema/interview-schema'
import { auth } from '@/lib/auth'

export default async function InterviewsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const interviews = await db
    .select({
      id: interview.id,
      title: interview.title,
      createdAt: interview.createdAt,
      theme: interview.theme,
      articleId: article.id,
    }) //
    .from(interview)
    .leftJoin(article, eq(interview.id, article.interviewId))
    .where(eq(interview.authorId, session.user.id))
    .orderBy(desc(interview.createdAt))

  return <Interviews interviews={interviews} />
}
