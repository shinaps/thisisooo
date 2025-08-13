'use server'

import { generateObject } from 'ai'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getDb } from '@/drizzle/client'
import { ARTICLE_STATUS, article } from '@/drizzle/schema/d1/article-schema'
import { interview, type SelectInterview, type TextContent } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

const basePrompt = `
あなたは日本語の熟練編集者です。  
以下のインタビュー逐語原稿から、読みやすく、事実に忠実なインタビュー記事を生成してください。  

[出力仕様]
- 出力は必ず次の形式で返すこと
{
  "title": "記事タイトル（60字以内）",
  "body": "Markdown形式の本文（本文中にタイトルを含めない）"
}
- "title" と "body" の内容は整合性を保つこと
- "body" はMarkdown形式とし、最初の行にタイトルは記載しない

[本文条件]
- 記事の内容は、インタビューの内容に基づき、事実に忠実であること
- 読みやすく、自然な日本語で書くこと。質問に対して文脈が合うように編集してもよい
- 会話形式を保ち、臨場感のあるインタビュー記事を意識
- 固有名詞・組織名は原稿準拠。初出のみ補足可（例: Foo株式会社（Foo Inc.））
- 冗長な相槌やノイズ語は削除
- インタビュワー、回答者などの区別はh3かpタグかで判別するため、本文に記載しない

[テーマ構成ルール]
- テーマ数は**最大4つまで**とする
- 内容が近い場合はテーマを統合し、無理に細分化しない
- テーマはインタビュー全体を通じて重要な話題に基づき定義する
- テーマ順は読者が理解しやすい流れに並べる

[Markdown構成]
1〜2文の導入（記事全体のテーマと概要・導入）

## {テーマ1: インタビューのテーマを記載}

### {インタビュワーからの質問:質問内容のみ記載}

{回答者の回答:回答内容のみ記載}

## {テーマ2: インタビューのテーマを記載}
（同上）

... （最大4テーマまで追加）

#### {1〜2文のまとめ（記事全体のまとめをインタビュワー視点で）}
`

const generatePrompt = (interview: SelectInterview) => {
  const textContents = interview.content.filter((message) => message.type === 'text') satisfies TextContent[]
  const interviewMessages = textContents.filter((content) => content.role !== 'system')

  let prompt = basePrompt

  prompt += `--- ここからインタビュー原稿 ---\n\n`

  for (const message of interviewMessages) {
    if (message.role === 'user') {
      prompt += `回答者: ${message.content}\n\n`
    } else if (message.role === 'assistant') {
      prompt += `インタビュワー: ${message.content}\n\n`
    }
  }

  prompt += `--- ここまでインタビュー原稿 ---\n\n`

  return prompt
}

export const continueGenerateArticleAction = async (interviewId: string, articleId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }
  const db = await getDb()
  const [selectedInterview] = await db
    .select() //
    .from(interview)
    .where(
      and(
        eq(interview.id, interviewId), //
        eq(interview.authorId, session.user.id),
      ),
    )
    .limit(1)
  const prompt = generatePrompt(selectedInterview)

  await db
    .update(article) //
    .set({ status: ARTICLE_STATUS.IN_PROGRESS })
    .where(eq(article.id, articleId))

  const { object } = await generateObject({
    model: openai('gpt-5-2025-08-07'),
    schema: z.object({
      title: z.string(),
      body: z.string(),
    }),
    prompt: prompt,
  })

  const { title, body } = object
  await db
    .update(article)
    .set({
      title: title,
      content: body,
      status: ARTICLE_STATUS.COMPLETED,
    })
    .where(eq(article.id, articleId))

  return {
    title,
    body,
  }
}
