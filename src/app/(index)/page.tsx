import { desc } from 'drizzle-orm'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { PublicArticles } from '@/app/(index)/_components/public-articles'
import { db } from '@/drizzle/client'
import { article } from '@/drizzle/schema/article-schema'
import { user } from '@/drizzle/schema/auth-schema'

export default async function Home() {
  const articles = await db
    .select({
      id: article.id,
      theme: article.theme,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      userName: user.name || 'anonymous',
    }) //
    .from(article)
    .leftJoin(user, eq(article.authorId, user.id))
    .where(eq(article.published, true))
    .limit(20)
    .orderBy(desc(article.createdAt))

  return <PublicArticles articles={articles} />
}
