import { eq } from 'drizzle-orm/sql/expressions/conditions'
import type { Metadata, ResolvingMetadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { MyArticle } from '@/app/articles/[articleId]/_components/my-article'
import { NotMyArticle } from '@/app/articles/[articleId]/_components/not-my-article'
import { getDb } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'
import { auth } from '@/lib/auth'

export async function generateMetadata({ params }: PageProps<'/articles/[articleId]'>, parent: ResolvingMetadata): Promise<Metadata> {
  const { articleId } = await params

  const db = getDb()
  const [selectedArticle] = await db
    .select({
      title: article.title,
      content: article.content,
      userDisplayName: userProfile.name,
    }) //
    .from(article)
    .leftJoin(userProfile, eq(article.authorId, userProfile.userId))
    .where(eq(article.id, articleId))

  const parentMeta = await parent

  if (!selectedArticle) {
    return {
      title: parentMeta.title,
      description: parentMeta.description,
    }
  }

  let description = ''
  if (selectedArticle.content) {
    description = selectedArticle.content.split('\n')[0]
  } else {
    description = `${selectedArticle.title} | ${selectedArticle.userDisplayName}`
  }

  return {
    title: selectedArticle.title,
    description: description,
  }
}

export default async function ArticlePage({ params }: PageProps<'/articles/[articleId]'>) {
  const { articleId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const db = getDb()
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
      userDisplayName: userProfile.name,
      tone: article.tone,
    }) //
    .from(article)
    .leftJoin(userProfile, eq(article.authorId, userProfile.userId))
    .where(eq(article.id, articleId))

  if (!selectedArticle) {
    redirect('/articles')
  }

  if (!session?.user || session.user.id !== selectedArticle.authorId) {
    return <NotMyArticle article={selectedArticle} />
  }

  return <MyArticle article={selectedArticle} />
}
