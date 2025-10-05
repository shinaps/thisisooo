# 技術スタック

## フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
  - Typed Routes有効 (`typedRoutes: true`)
  - Parallel Routes使用 (headerスロット)
- **React**: 19.2.0
- **スタイリング**: 
  - Tailwind CSS 4
  - shadcn/ui
  - next-themes (ダークモード対応)
- **UI ライブラリ**:
  - Radix UI (各種コンポーネント)
  - lucide-react (アイコン)
  - sonner (トースト通知)

## バックエンド
- **ランタイム**: Cloudflare Workers
- **アダプター**: @opennextjs/cloudflare
- **ORM**: Drizzle ORM
- **データベース**:
  - Turso (LibSQL) - 認証データ用
  - Cloudflare D1 (SQLite) - アプリケーションデータ用

## 認証
- **認証ライブラリ**: better-auth 1.3.26
- **認証方式**:
  - Google OAuth
  - Email/Password
- **セッション管理**: クッキーベース

## AI
- **SDK**: Vercel AI SDK (AI RSC)
- **モデルプロバイダ**: OpenAI
- **機能**:
  - ストリーミング対応のインタビュー生成
  - 音声文字起こし (Whisper)
  - 記事生成

## 開発ツール
- **TypeScript**: 5.9.3
- **Linter/Formatter**: Biome 2.1.4
- **パッケージマネージャー**: pnpm
- **デプロイツール**: wrangler (Cloudflare CLI)

## その他ライブラリ
- **環境変数管理**: @t3-oss/env-nextjs + Zod
- **Markdown処理**: markdown-it
- **日付処理**: dayjs
- **HTML サニタイズ**: dompurify
- **クラス結合**: clsx + tailwind-merge (cn関数)