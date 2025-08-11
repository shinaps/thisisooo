import { Article } from '@/app/articles/[articleId]/_components/article'
import { WaitForArticle } from '@/app/articles/[articleId]/_components/wait-for-article'
import { ARTICLE_STATUS } from '@/drizzle/schema/article-schema'

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
  }
}
export const MyArticle = (props: Props) => {
  if (props.article.status !== ARTICLE_STATUS.COMPLETED) {
    return <WaitForArticle articleId={props.article.id} initialStatus={props.article.status} />
  }

  return <Article article={props.article} />
}
