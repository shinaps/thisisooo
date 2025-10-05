# 主要コマンド

## 開発・ビルド

### ローカル開発
```bash
pnpm dev
```
Next.js開発サーバーを起動。`http://localhost:3000` でアクセス可能。

### プロダクションビルド
```bash
pnpm build
```
OpenNext形式でビルドを実行。

### プロダクションサーバー起動
```bash
pnpm start
```

### Cloudflareプレビュー
```bash
pnpm preview
```
Cloudflare環境でビルドをプレビュー確認。

## コード品質

### Linter実行
```bash
pnpm lint
```
Next.jsの標準lintを実行。

### コード自動修正
```bash
pnpm fix
```
Biomeでsrc配下のコードを自動修正（フォーマット + lint fix）。

## デプロイ

### ステージング環境
```bash
pnpm deploy:stg
```
stg.thisis.ooo にデプロイ。

### 本番環境
```bash
pnpm deploy:prod
```
thisis.ooo にデプロイ。

## データベース操作

### Turso (認証データ)

#### better-authスキーマ生成
```bash
pnpm better-auth:generate
```
`src/drizzle/schema/turso/auth-schema.ts` を生成。

#### マイグレーションファイル生成
```bash
pnpm generate:turso
```

#### マイグレーション実行
```bash
# ステージング
pnpm migrate:turso:stg

# 本番
pnpm migrate:turso:prod
```

### D1 (アプリケーションデータ)

#### マイグレーションファイル生成
```bash
pnpm generate:d1
```

#### マイグレーション実行
```bash
# ローカル開発
pnpm migrate:d1:dev

# プレビュー
pnpm migrate:d1:preview

# ステージング
pnpm migrate:d1:stg

# 本番
pnpm migrate:d1:prod
```

### Cloudflare型定義生成
```bash
pnpm cf-typegen
```
`wrangler.jsonc`からCloudflare環境変数の型定義を`cloudflare-env.d.ts`に生成。

## Darwin (macOS) システムコマンド
- `ls` - ディレクトリ内容表示
- `cd` - ディレクトリ移動
- `git` - バージョン管理
- `grep` - テキスト検索
- `find` - ファイル検索