import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { MyArticle } from '@/app/articles/[articleId]/_components/my-article'
import { NotMyArticle } from '@/app/articles/[articleId]/_components/not-my-article'
import { db } from '@/drizzle/client'
import { article } from '@/drizzle/schema/article-schema'
import { user } from '@/drizzle/schema/auth-schema'
import { auth } from '@/lib/auth'

export default async function ArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const [selectedArticle] = await db
    .select({
      id: article.id,
      title: article.title,
      content: article.content,
      published: article.published,
      status: article.status,
      interviewId: article.interviewId,
      authorId: article.authorId,
      createdAt: article.createdAt,
      userDisplayName: user.name,
    }) //
    .from(article)
    .leftJoin(user, eq(article.authorId, user.id))
    .where(eq(article.id, articleId))

  if (!selectedArticle) {
    redirect('/')
  }

  if (selectedArticle.authorId === session.user.id) {
    return <MyArticle article={selectedArticle} />
  }

  return <NotMyArticle article={selectedArticle} />
}
