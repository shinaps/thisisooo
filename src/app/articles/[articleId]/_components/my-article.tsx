import { Article } from '@/app/articles/[articleId]/_components/article'

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
export const MyArticle = (props: Props) => {
  return <Article article={props.article} />
}
