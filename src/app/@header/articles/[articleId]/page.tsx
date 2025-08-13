import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { Notebook } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ArticleActions } from '@/app/@header/articles/[articleId]/_components/article-actions'
import { Button } from '@/components/ui/button'
import { getDb } from '@/drizzle/client'
import { ARTICLE_STATUS, article } from '@/drizzle/schema/d1/article-schema'
import { auth } from '@/lib/auth'

export default async function ArticleHeader({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const db = await getDb()
  const [selectedArticle] = await db
    .select() //
    .from(article)
    .where(eq(article.id, articleId))

  if (!selectedArticle) {
    return (
      <div className="mx-auto max-w-screen-lg h-16 flex items-center px-4">
        <Link href="/" className="font-semibold">
          this is ◯◯◯
        </Link>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-screen-lg h-16 flex items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          this is ◯◯◯
        </Link>
        <Link href="/sign-in">
          <Button>ログイン</Button>
        </Link>
      </div>
    )
  }

  const isAuthor = session.user.id === selectedArticle.authorId
  if (isAuthor && selectedArticle.status === ARTICLE_STATUS.COMPLETED) {
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
          <ArticleActions article={selectedArticle} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-screen-lg h-16 flex items-center px-4">
      <Link href="/" className="font-semibold">
        this is ◯◯◯
      </Link>
    </div>
  )
}
