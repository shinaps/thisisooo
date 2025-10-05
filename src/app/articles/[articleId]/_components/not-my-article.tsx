import { redirect } from 'next/navigation'
import { Article } from '@/app/articles/[articleId]/_components/article'
import { ARTICLE_STATUS } from '@/drizzle/schema/d1/article-schema'

type Props = {
  article: {
    id: string
    title: string | null
    content: string | null
    published: boolean
    status: number
    interviewId: string
    authorId: string
    createdAt: Date
    userDisplayName: string | null
    tone: 'interview' | 'blog'
  }
}
export const NotMyArticle = (props: Props) => {
  const cannotAccess =
    !props.article.published || //
    props.article.status !== ARTICLE_STATUS.COMPLETED

  if (cannotAccess) {
    console.log('cannot access')
    redirect('/')
  }

  return <Article article={props.article} />
}
