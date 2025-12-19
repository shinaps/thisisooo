import { desc } from 'drizzle-orm'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { PublicArticles } from '@/app/(index)/_components/public-articles'
import { getDbAsync } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const db = await getDbAsync()
  const articles = await db
    .select({
      id: article.id,
      theme: article.theme,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      userName: userProfile.name || 'anonymous',
    }) //
    .from(article)
    .leftJoin(userProfile, eq(article.authorId, userProfile.userId))
    .where(eq(article.published, true))
    .limit(20)
    .orderBy(desc(article.createdAt))

  return <PublicArticles articles={articles} />
}
