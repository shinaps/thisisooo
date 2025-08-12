import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'

type Props = {
  cost: number
  articles: {
    id: string
    theme: string
    title: string | null
    content: string | null
    createdAt: Date
    userName: string | null
  }[]
}
export const PublicArticles = (props: Props) => {
  return (
    <div className="flex flex-col px-4 py-8 gap-y-12">
      <div className="flex flex-col gap-y-2">
        <span className="text-sm font-semibold">this is ooo monthly budget</span>
        <Progress value={(props.cost / 10) * 100} />
      </div>
      <div className="flex flex-col gap-y-4">
        <h2 className="font-semibold text-lg">最新の記事</h2>
        <div className="w-full items-center flex flex-col gap-y-4">
          {props.articles.map((article) => {
            return (
              <Link href={`/articles/${article.id}`} key={article.id} className="w-full">
                <Card>
                  <CardHeader className="gap-y-4">
                    <Badge className="w-fit">this is 私の{article.theme}</Badge>
                    <CardTitle>{article.title}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <div className="flex justify-between w-full gap-x-4">
                      <span className="truncate">{article.userName}</span>
                      <span className="shrink-0">{formatDate(article.createdAt)}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
