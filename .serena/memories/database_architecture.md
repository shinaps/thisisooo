# データベースアーキテクチャ

## 2つの独立したデータベース

### 1. Turso (LibSQL) - 認証データ
**場所**: `src/drizzle/schema/turso/`

**用途**: better-authの認証データ管理

**主要テーブル**:
- users
- sessions
- accounts
- (その他better-authが管理するテーブル)

**接続方法**:
```typescript
// src/lib/auth.ts
import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

const db = drizzle(client)
```

**マイグレーション設定**: `drizzle.turso.config.ts`
- dialect: `turso`
- out: `drizzle/turso`
- schema: `src/drizzle/schema/turso/**/*.ts`

### 2. Cloudflare D1 (SQLite) - アプリケーションデータ
**場所**: `src/drizzle/schema/d1/`

**用途**: アプリケーション固有のデータ管理

**主要テーブル**:

#### articles
- 記事データ
- ステータス管理 (draft, generating, published)
- ユーザーとの関連

#### interviews
- インタビューデータ
- メッセージ履歴 (JSON形式)
- コンテンツタイプ (text, image)

#### userProfile
- ユーザープロフィール
- better-authのusersテーブルとuserIdで関連

**接続方法**:
```typescript
// src/drizzle/client.ts
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'
import { cache } from 'react'

// Server Components用（同期版）
export const getDb = cache(() => {
  const { env } = getCloudflareContext()
  return drizzle(env.D1)
})

// 非同期版
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true })
  return drizzle(env.D1)
})
```

**マイグレーション設定**: `drizzle.d1.config.ts`
- dialect: `sqlite`
- out: `drizzle/d1`
- schema: `src/drizzle/schema/d1/**/*.ts`

## 環境別のデータベース

### Turso
- ステージング: `.env.development` の `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`
- 本番: `.env.production` の `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`

### D1
- 開発: `d1` (next-dev-d1)
- プレビュー: `d1` (preview-d1)
- ステージング: `thisisooo-d1-stg`
- 本番: `thisisooo-d1-prod`

設定は `wrangler.jsonc` で管理。

## 重要な注意点
1. **2つのデータベースは完全に独立**: Tursoは認証のみ、D1はアプリケーションデータのみ
2. **接続方法が異なる**: Tursoは`@libsql/client`、D1は`getCloudflareContext()`経由
3. **マイグレーションも独立**: それぞれ別のディレクトリとコマンドで管理
4. **userProfileとusersの関連**: better-authのafter hookでOAuth認証後に自動作成