import { desc } from 'drizzle-orm'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Articles } from '@/app/articles/_components/articles'
import { getDb } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'
import { auth } from '@/lib/auth'

export default async function ArticlesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = await getDb()
  const articles = await db
    .select() //
    .from(article)
    .where(eq(article.authorId, session.user.id))
    .orderBy(desc(article.createdAt))

  return <Articles articles={articles} />
}
