'use server'

import { createStreamableValue } from '@ai-sdk/rsc'
import { streamText } from 'ai'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/drizzle/client'
import { ARTICLE_STATUS, article } from '@/drizzle/schema/d1/article-schema'
import { interview, type SelectInterview, type TextContent } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

const interviewPrompt = `
[出力仕様]
出力はMarkdown形式の本文のみを返してください。（本文中にタイトルを含めない）

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

const blogPrompt = `
[出力仕様]
出力はMarkdown形式の本文のみを返してください。（本文中にタイトルを含めない）

[本文条件]
- 記事の内容は、インタビュー内容に基づき、事実に忠実であること
- 回答者の一人称視点で、自然な語り口調のブログ記事として執筆すること
- インタビュワーの質問は記事に含めず、回答者の語りとして再構成すること
- 読みやすく、親しみやすい文体で書くこと
- 固有名詞・組織名は原稿準拠。初出のみ補足可（例: Foo株式会社（Foo Inc.））
- 冗長な相槌やノイズ語は削除し、自然な文章に整える

[テーマ構成ルール]
- テーマ数は**最大4つまで**とする
- 内容が近い場合はテーマを統合し、無理に細分化しない
- テーマはブログ記事全体を通じて重要な話題に基づき定義する
- テーマ順は読者が理解しやすい流れに並べる

[Markdown構成]
1〜2段落の導入（記事全体のテーマと概要を回答者視点で）

## {テーマ1: ブログのセクションタイトル}

{回答者の語りとして再構成された本文。自然な段落構成で}

## {テーマ2: ブログのセクションタイトル}
（同上）

... （最大4テーマまで追加）

1〜2段落のまとめ（記事全体のまとめを回答者視点で）
`

const generatePrompt = (interview: SelectInterview, title: string, tone: 'interview' | 'blog') => {
  const textContents = interview.content.filter((message) => message.type === 'text') satisfies TextContent[]
  const interviewMessages = textContents.filter((content) => content.role !== 'system')

  let prompt = ''

  if (tone === 'interview') {
    prompt = 'あなたは日本語の熟練編集者です。\n以下のインタビュー逐語原稿から、読みやすく、事実に忠実なインタビュー記事を生成してください。\n'
    prompt += `インタビュー記事のタイトルは「${title}」とします。\n\n`
    prompt += interviewPrompt
  } else {
    prompt = 'あなたは日本語の熟練編集者です。\n以下のインタビュー逐語原稿から、回答者の一人称視点で自然な語り口調のブログ記事を生成してください。\n'
    prompt += `ブログ記事のタイトルは「${title}」とします。\n\n`
    prompt += blogPrompt
  }

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

export const generateArticleContentAction = async (
  interviewId: string, //
  articleId: string,
  title: string,
  tone: 'interview' | 'blog',
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = getDb()
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
  const prompt = generatePrompt(selectedInterview, title, tone)
  const stream = createStreamableValue<string, Error>()

  ;(async () => {
    const { textStream } = streamText({
      model: openai('gpt-5-chat-latest'),
      prompt: prompt,
    })

    let content = ''
    for await (const text of textStream) {
      content += text
      stream.update(text)
    }

    await db
      .update(article)
      .set({
        content: content,
        status: ARTICLE_STATUS.COMPLETED,
      })
      .where(eq(article.id, articleId))

    stream.done()
  })()

  return {
    content: stream.value,
  }
}
