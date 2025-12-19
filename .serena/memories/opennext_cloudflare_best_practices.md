# OpenNext + Cloudflare Workers でNext.jsをホスティングするベストプラクティス

このドキュメントは、最新のスタック（Next.js 15 + OpenNext + Cloudflare Workers）を使用したプロジェクトから学んだ重要なナレッジをまとめたものです。

## 1. プロジェクト構成の基本

### 必須パッケージ
```json
{
  "dependencies": {
    "@opennextjs/cloudflare": "^1.9.1",
    "next": "15.5.0",
    "server-only": "^0.0.1"
  },
  "devDependencies": {
    "wrangler": "^4.42.0"
  }
}
```

### ディレクトリ構造
```
project/
├── src/
│   ├── app/              # Next.js App Router
│   ├── drizzle/
│   │   ├── client.ts     # D1データベースクライアント
│   │   └── schema/
│   │       ├── d1/       # Cloudflare D1用スキーマ
│   │       └── turso/    # Turso用スキーマ
│   ├── lib/
│   │   ├── auth.ts       # 認証設定
│   │   └── env.ts        # 環境変数管理
│   └── middleware.ts     # 認証ミドルウェア
├── drizzle/              # マイグレーションファイル
│   ├── d1/
│   └── turso/
├── next.config.ts
├── open-next.config.ts
├── wrangler.jsonc
├── drizzle.d1.config.ts
└── drizzle.turso.config.ts
```

## 2. Next.js設定 (next.config.ts)

### 重要な設定ポイント

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Tursoクライアント用パッケージを外部化（必須）
  serverExternalPackages: [
    '@libsql/client',
    '@libsql/isomorphic-ws',
  ],
  
  // Server Actionsのボディサイズ制限
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  
  // 型安全なルーティング
  typedRoutes: true,
}

export default nextConfig

// 開発環境でgetCloudflareContext()を呼び出せるようにする（必須）
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
```

**重要な注意点:**
- `serverExternalPackages`にTurso関連パッケージを追加しないとビルドエラーになる
- `initOpenNextCloudflareForDev()`を呼ばないと開発環境で`getCloudflareContext()`が使えない

## 3. OpenNext設定 (open-next.config.ts)

### インクリメンタルキャッシュの最適化

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache'

export default defineCloudflareConfig({
  // R2 + Regional Cacheでパフォーマンス最適化
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',           // キャッシュを長期間保持
    shouldLazilyUpdateOnCacheHit: true,  // キャッシュヒット時に遅延更新
  }),
})
```

**メリット:**
- ISR（Incremental Static Regeneration）のパフォーマンス向上
- Cloudflare R2の低コストストレージを活用
- Regional Cacheで世界中で高速アクセス

## 4. Wrangler設定 (wrangler.jsonc)

### 環境別設定の構造

```jsonc
{
  "name": "your-app",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  
  // アセット配信
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },
  
  // 監視を有効化
  "observability": {
    "enabled": true
  },
  
  // ローカル開発用のデフォルト設定
  "kv_namespaces": [...],
  "d1_databases": [
    {
      "binding": "D1",
      "database_name": "d1",
      "database_id": "next-dev-d1",
      "migrations_dir": "drizzle/d1"  // マイグレーションディレクトリ指定
    }
  ],
  
  // 環境別設定
  "env": {
    "development": {
      // プレビュー環境用
      "kv_namespaces": [...],
      "d1_databases": [...],
      "services": [
        {
          "binding": "WORKER_SELF_REFERENCE",
          "service": "your-app"
        }
      ],
      "r2_buckets": [
        {
          "binding": "NEXT_INC_CACHE_R2_BUCKET",
          "bucket_name": "your-app-next-incremental-cache-dev"
        }
      ]
    },
    "staging": {
      "name": "your-app-stg",
      "route": {
        "custom_domain": true,
        "pattern": "stg.yourdomain.com"
      },
      // KV/D1/R2の本番ID/名前を指定
      "kv_namespaces": [...],
      "d1_databases": [...],
      "r2_buckets": [...]
    },
    "production": {
      "name": "your-app",
      "route": {
        "custom_domain": true,
        "pattern": "yourdomain.com"
      },
      // 本番環境のbindings
    }
  }
}
```

**ポイント:**
- `compatibility_flags`に`nodejs_compat`が必須
- 各環境ごとにKV/D1/R2のIDを分ける
- `WORKER_SELF_REFERENCE`はOpenNextが内部で使用
- `migrations_dir`でマイグレーションの場所を指定

## 5. デュアルデータベース構成

### なぜ2つのデータベースを使うのか

**Turso (LibSQL)** - 認証データ用
- better-authが推奨するリモートデータベース
- Edge環境からの高速アクセス
- 自動バックアップとスケーリング

**Cloudflare D1 (SQLite)** - アプリケーションデータ用
- Cloudflare Workersとの統合が容易
- 無料枠が大きい
- 低レイテンシ

### Turso接続パターン

```typescript
// src/lib/auth.ts
import { createClient } from '@libsql/client/web'
import { drizzle as drizzleTurso } from 'drizzle-orm/libsql'
import * as schema from '@/drizzle/schema/turso/auth-schema'

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

const db = drizzleTurso(client, { schema })
```

### D1接続パターン

```typescript
// src/drizzle/client.ts
import 'server-only'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'
import { cache } from 'react'

// Server Components用（同期版）
export const getDb = cache(() => {
  const { env } = getCloudflareContext()
  return drizzle(env.D1)
})

// 必要に応じて非同期版
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true })
  return drizzle(env.D1)
})
```

**重要:**
- D1は`getCloudflareContext()`経由でアクセス
- `cache()`でリクエストごとにキャッシュ
- `'server-only'`をインポートしてクライアント実行を防ぐ
- Tursoは通常のクライアント作成パターン

### Drizzle設定の分離

**D1用 (drizzle.d1.config.ts)**
```typescript
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle/d1',
  schema: './src/drizzle/schema/d1',
  dialect: 'sqlite',
})
```

**Turso用 (drizzle.turso.config.ts)**
```typescript
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle/turso',
  schema: './src/drizzle/schema/turso',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
})
```

## 6. 認証システム (better-auth)

### better-authとDrizzleの統合

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { openAPI } from 'better-auth/plugins'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  
  emailAndPassword: {
    enabled: true,
  },
  
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:8787',
    'https://yourdomain.com',
  ],
  
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  
  plugins: [openAPI()],
  
  // OAuth後の自動処理
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/callback/:id')) {
        const newSession = ctx.context.newSession
        if (newSession) {
          // D1のuserProfileテーブルに自動作成
          const db = getDb()
          const [user] = await db
            .select()
            .from(userProfile)
            .where(eq(userProfile.userId, newSession.user.id))
          
          if (!user) {
            await db.insert(userProfile).values({
              userId: newSession.user.id,
              name: newSession.user.name,
              image: newSession.user.image,
            })
          }
        }
      }
    }),
  },
})
```

**ポイント:**
- Tursoに認証データを保存
- OAuth認証後、D1にユーザープロフィールを自動作成
- after hookで2つのDBを連携

### Middlewareでの認証チェック

```typescript
// src/middleware.ts
import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  
  if (!sessionCookie) {
    const isPublicRoute =
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/sign-in') ||
      request.nextUrl.pathname.startsWith('/articles/')
    
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
```

**注意:**
- これはあくまで最適化的なリダイレクト
- 各ページ/ルートで適切に認証チェックを行うこと

## 7. 環境変数管理

### @t3-oss/env-nextjsによる型安全な管理

```typescript
// src/lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    TURSO_DATABASE_URL: z.url(),
    TURSO_AUTH_TOKEN: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    OPENAI_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
})
```

**メリット:**
- Zodによる実行時バリデーション
- TypeScriptの型推論
- 環境変数の欠落を早期検出

## 8. デプロイメントとマイグレーション

### package.jsonのスクリプト構成

```json
{
  "scripts": {
    // 開発・ビルド
    "dev": "next dev --turbopack",
    "build": "next build",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview --env development",
    
    // デプロイ
    "deploy:stg": "opennextjs-cloudflare build && opennextjs-cloudflare deploy --env staging",
    "deploy:prod": "opennextjs-cloudflare build && opennextjs-cloudflare deploy --env production",
    
    // Cloudflare型定義生成
    "cf-typegen": "wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts",
    
    // Tursoマイグレーション
    "better-auth:generate": "npx @better-auth/cli@latest generate --output src/drizzle/schema/turso/auth-schema.ts --yes",
    "generate:turso": "npx drizzle-kit generate --config=drizzle.turso.config.ts",
    "migrate:turso:stg": "dotenv -e .env.development -- npx drizzle-kit migrate --config=drizzle.turso.config.ts",
    "migrate:turso:prod": "npx drizzle-kit migrate --config=drizzle.turso.config.ts",
    
    // D1マイグレーション
    "generate:d1": "npx drizzle-kit generate --config=drizzle.d1.config.ts",
    "migrate:d1:dev": "wrangler d1 migrations apply d1",
    "migrate:d1:preview": "wrangler d1 migrations apply d1 --env development",
    "migrate:d1:stg": "wrangler d1 migrations apply thisisooo-d1-stg --env staging --remote",
    "migrate:d1:prod": "wrangler d1 migrations apply thisisooo-d1-prod --env production --remote"
  }
}
```

### デプロイフロー

**ステージング環境へのデプロイ:**
```bash
# 1. D1マイグレーション
pnpm generate:d1
pnpm migrate:d1:stg

# 2. Tursoマイグレーション（必要に応じて）
pnpm generate:turso
pnpm migrate:turso:stg

# 3. デプロイ
pnpm deploy:stg
```

**本番環境へのデプロイ:**
```bash
# 1. D1マイグレーション
pnpm migrate:d1:prod

# 2. Tursoマイグレーション
pnpm migrate:turso:prod

# 3. デプロイ
pnpm deploy:prod
```

**重要な注意点:**
- マイグレーションは必ずデプロイ前に実行
- D1の`--remote`フラグで本番DBに適用
- Tursoは`.env`の環境変数で接続先を切り替え

## 9. トラブルシューティング

### よくある問題と解決策

#### 1. "Cannot find module '@libsql/client'"
```typescript
// next.config.tsに追加
serverExternalPackages: ['@libsql/client', '@libsql/isomorphic-ws']
```

#### 2. "getCloudflareContext is not a function" (開発環境)
```typescript
// next.config.tsの最後に追加
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
```

#### 3. D1のbindingが見つからない
- `wrangler.jsonc`で該当環境のbinding名を確認
- `wrangler types`で型定義を再生成
- `migrations_dir`が正しく設定されているか確認

#### 4. ビルドは成功するがデプロイで失敗
- `wrangler.jsonc`のdatabase_idが正しいか確認
- R2バケットが作成されているか確認
- `pnpm cf-typegen`で型定義を更新

## 10. パフォーマンス最適化

### キャッシング戦略

1. **R2 Incremental Cache** - ISRのキャッシュをR2に保存
2. **Regional Cache** - エッジロケーションでキャッシュ
3. **React cache()** - リクエストごとのメモ化

### 推奨設定

```typescript
// open-next.config.ts
incrementalCache: withRegionalCache(r2IncrementalCache, {
  mode: 'long-lived',
  shouldLazilyUpdateOnCacheHit: true,
})
```

## 11. セキュリティベストプラクティス

1. **環境変数の管理**
   - `.env`ファイルを`.gitignore`に追加
   - Cloudflare Dashboardでシークレットを設定
   - `@t3-oss/env-nextjs`で型安全に管理

2. **認証の実装**
   - Middlewareでの楽観的リダイレクト
   - 各ページで適切な認証チェック
   - `server-only`パッケージで重要な処理を保護

3. **CORS設定**
   - `trustedOrigins`に許可するドメインのみ追加
   - 開発環境と本番環境で分ける

## まとめ

このスタックの主な利点:
- ✅ エッジで高速動作
- ✅ Cloudflareの無料枠が充実
- ✅ 型安全な開発体験
- ✅ スケーラブルな認証とDB構成
- ✅ ISRとキャッシュ戦略の最適化

注意点:
- ⚠️ まだ新しいスタックなのでドキュメントが少ない
- ⚠️ デュアルDB構成は管理が複雑
- ⚠️ マイグレーション手順を間違えると危険
- ⚠️ 開発環境と本番環境の設定差異に注意

このドキュメントを参考に、他のプロジェクトでもOpenNext + Cloudflare Workersの構成を採用できます。
