# 開発ガイドライン

## プロジェクトの特徴

### Cloudflare Workers環境
- Next.js 15をCloudflare Workers上で実行
- `@opennextjs/cloudflare`を使用
- Edge環境での制約を考慮すること

### サーバーサイドの注意点
- `'server-only'` パッケージを使用してサーバー専用コードを明示
- Server ComponentsではCloudflareのバインディングを使用可能
- `getCloudflareContext()` でD1、KV、R2などにアクセス

## インタビュー機能の実装パターン

### プロンプト定義
`src/app/interviews/_prompts/` にテーマ別のプロンプトを定義。

例:
```typescript
// career-interview.ts
export const careerInterviewPrompt = `
あなたは経験豊富なキャリアカウンセラーです...
`
```

### Server Actions
Vercel AI SDKのAI RSCを使用したストリーミング対応。

```typescript
import { streamUI } from 'ai/rsc'
import { openai } from '@/lib/openai'

export async function continueConversationAction(messages: Message[]) {
  const result = await streamUI({
    model: openai('gpt-4o'),
    messages,
    // ...
  })
  return result.value
}
```

### クライアントコンポーネント
`use-recording-and-transcribe.ts` でマイク録音と文字起こし。

## 記事生成の実装パターン

### ステータス管理
記事には以下のステータスがある:
- `draft` - 下書き
- `generating` - 生成中
- `published` - 公開済み

### Server Actionsパターン
```typescript
'use server'

import { getDb } from '@/drizzle/client'

export async function generateArticleAction(articleId: string) {
  const db = getDb()
  // ...処理
}
```

## 認証の実装パターン

### better-auth
```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  // after hook for profile creation
})
```

### クライアントサイド
```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
})
```

## 環境変数の管理

### 定義方法
```typescript
// src/lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    TURSO_DATABASE_URL: z.string().url(),
    TURSO_AUTH_TOKEN: z.string(),
    // ...
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    // ...
  },
})
```

### 使用方法
```typescript
import { env } from '@/lib/env'

const url = env.NEXT_PUBLIC_APP_URL // 型安全
```

## UI コンポーネント

### shadcn/ui
`src/components/ui/` に配置。

使用例:
```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
```

### カスタムコンポーネント
`src/components/` に配置。

例:
- `confirm-dialog.tsx` - 確認ダイアログ
- `providers.tsx` - アプリケーション全体のプロバイダー

## スタイリング

### cn関数
```typescript
import { cn } from '@/lib/utils'

<div className={cn('base-class', condition && 'conditional-class')} />
```

### Tailwind CSS 4
最新のTailwind CSS 4を使用。カスタムプロパティベースの設計。

## デバッグとログ

### console.log
Biomeで許可されているため自由に使用可能。

### エラーハンドリング
```typescript
try {
  // 処理
} catch (error) {
  console.error('Error:', error)
  // エラー処理
}
```

## パフォーマンス最適化

### キャッシング
- React の `cache()` 関数を使用
- OpenNext の R2 Incremental Cache
- Regional Cache with long-lived mode

### Server Components優先
- デフォルトでServer Componentsを使用
- 必要な場合のみ`'use client'`を追加

## セキュリティ

### サーバー専用コード
```typescript
import 'server-only'

// このファイルはサーバーでのみ実行される
```

### HTML サニタイズ
```typescript
import DOMPurify from 'dompurify'

const clean = DOMPurify.sanitize(dirty)
```