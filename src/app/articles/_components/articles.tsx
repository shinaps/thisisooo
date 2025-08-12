'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { SelectArticle } from '@/drizzle/schema/article-schema'

type Props = {
  articles: SelectArticle[]
}
export const Articles = (props: Props) => {
  return (
    <div className="flex flex-col px-4 py-8 gap-y-4">
      <h2 className="font-semibold text-lg">自分の記事</h2>
      <div className="w-full items-center flex flex-col gap-y-4">
        {props.articles.map((article) => {
          const date = new Date(article.createdAt)
          const formattedDateTime = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
          return (
            <Link href={`/articles/${article.id}`} key={article.id} className="w-full">
              <Card>
                <CardHeader className="gap-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="w-fit">this is 私の{article.theme}</Badge>
                    <Badge variant="outline" className="w-fit">
                      {article.published ? '公開中' : '非公開'}
                    </Badge>
                  </div>
                  <CardTitle>{article.title || '記事を生成中です...'}</CardTitle>
                </CardHeader>
                <CardFooter>
                  <div className="flex justify-between w-full gap-x-4">
                    <span className="shrink-0">{formattedDateTime}</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
