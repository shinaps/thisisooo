# ルーティング構造とアーキテクチャ

## Parallel Routesの活用
このプロジェクトはNext.js App Routerの**Parallel Routes**を使用した特殊な構造。

### ルートレイアウト構造
```typescript
// src/app/layout.tsx
export default function RootLayout(props: LayoutProps<'/'>) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <header>{props.header}</header>  {/* headerスロット */}
          <main>{props.children}</main>    {/* childrenスロット */}
        </Providers>
      </body>
    </html>
  )
}
```

### ディレクトリ構造

#### ヘッダー（Parallel Route）
`src/app/@header/` - ヘッダー専用のParallel Route

**重要**: 各ページに対応するヘッダーページを必ず作成すること！

例:
- `src/app/@header/page.tsx` - トップページのヘッダー
- `src/app/@header/interviews/page.tsx` - インタビュー一覧のヘッダー
- `src/app/@header/interviews/[interviewId]/page.tsx` - インタビュー詳細のヘッダー
- `src/app/@header/articles/page.tsx` - 記事一覧のヘッダー
- `src/app/@header/articles/[articleId]/page.tsx` - 記事詳細のヘッダー
- `src/app/@header/profile/page.tsx` - プロフィールページのヘッダー
- `src/app/@header/sign-in/page.tsx` - サインインページのヘッダー

#### メインコンテンツ
- `src/app/(index)/` - トップページ（Route Group）
- `src/app/interviews/` - インタビュー機能
- `src/app/interviews/[interviewId]/` - インタビュー実行画面
- `src/app/articles/` - 記事表示機能
- `src/app/articles/[articleId]/` - 記事詳細画面
- `src/app/profile/` - プロフィール機能
- `src/app/sign-in/` - サインイン画面
- `src/app/api/auth/[...all]/` - better-auth APIルート

## ページ実装の原則（重要！）

### 完全独立実装
各ページは完全に独立した実装を行うこと。

#### 1. ヘッダーの実装
- **必須**: 各ページごとに `src/app/@header/[対応するパス]/page.tsx` を作成
- デフォルトのヘッダー (`src/app/@header/page.tsx`) に依存しない
- デフォルトだと反映されないことがあるため、明示的にページごとに実装

#### 2. コンポーネントとアクションの分離
- 各ページディレクトリに `_components/` と `_actions/` を独立して作成
- 他のページとコンポーネントやアクションを共通化しない
- 共通化が必要な場合は人間が判断して実施

#### 3. 独立したレイアウト設計
- 各ページは全く違うレイアウトで実装できるようにする
- ページ間の依存関係を最小限にする
- 将来的な変更や拡張に柔軟に対応できる構造を維持

## Private Folders
アンダースコアプレフィックスを使用してルーティングから除外:

- `_components/` - ページ固有のコンポーネント
- `_actions/` - Server Actions
- `_hooks/` - カスタムフック
- `_prompts/` - プロンプト定義

## 認証とミドルウェア

### ミドルウェア設定
`src/middleware.ts` でセッション確認を実施。

**パブリックルート（認証不要）**:
- `/` - トップページ
- `/sign-in` - サインインページ
- `/articles/*` - 記事表示（公開記事は誰でも閲覧可能）

**プライベートルート（認証必須）**:
- `/interviews` - インタビュー一覧
- `/interviews/[interviewId]` - インタビュー実行
- `/profile` - プロフィール

未認証時は `/sign-in` にリダイレクト。

## Typed Routes
`next.config.ts` で `typedRoutes: true` を設定。

型安全なルーティングが可能:
```typescript
import { Link } from 'next/link'

// 型安全なリンク
<Link href="/interviews/123">インタビュー</Link>

// 存在しないパスはTypeScriptエラー
<Link href="/non-existent">...</Link> // エラー
```

## OGP画像
- `src/app/opengraph-image.jpg` - デフォルトOGP画像
- `src/app/twitter-image.jpg` - TwitterカードOGP画像
- `src/app/articles/[articleId]/opengraph-image.tsx` - 記事ごとの動的OGP画像
- `src/app/articles/[articleId]/twitter-image.tsx` - 記事ごとのTwitterカードOGP画像