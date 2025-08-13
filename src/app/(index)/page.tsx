import dayjs from 'dayjs'
import { desc } from 'drizzle-orm'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { PublicArticles } from '@/app/(index)/_components/public-articles'
import { getDb } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'
import { env } from '@/lib/env'

const getProjectCost = async () => {
  try {
    const startOfMonth = dayjs().tz('Asia/Tokyo').startOf('month').unix()
    const projectId = env.OPENAI_PROJECT_ID
    const response = await fetch(`https://api.openai.com/v1/organization/costs?start_time=${startOfMonth}&limit=35&project_ids=${projectId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.OPENAI_ADMIN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    })

    const json = (await response.json()) as any
    const costUsd = json.data
      .filter((item: { results: string | any[] }) => item.results.length > 0)
      .map((item: { results: { amount: { value: any } }[] }) => item.results[0].amount.value)
      .reduce((acc: any, curr: any) => acc + curr, 0)

    return Math.round(costUsd * 100) / 100
  } catch (error) {
    console.error('Error fetching project cost:', error)
    return 0
  }
}

export default async function Home() {
  const db = await getDb()
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

  const cost = await getProjectCost()
  return <PublicArticles articles={articles} cost={cost} />
}
