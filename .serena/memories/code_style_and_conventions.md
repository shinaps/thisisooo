# コードスタイルと規約

## Biome設定

### フォーマッター
- **インデント**: スペース
- **クォート**: シングルクォート (`'`)
- **セミコロン**: 不要な場合は省略 (`asNeeded`)
- **行幅**: 200文字

### Linter
- **ベースルール**: recommended
- **無効化されているルール**:
  - `suspicious.noConsole` - console.log等は許可
  - `suspicious.noExplicitAny` - any型は許可
  - `suspicious.noArrayIndexKey` - 配列インデックスキーは許可
  - `suspicious.noReactSpecificProps` - React特有のpropsは許可
  - `correctness.useExhaustiveDependencies` - 依存関係の厳密チェックは無効
- **エラー扱いのルール**:
  - `correctness.noUnusedImports` - 未使用のimportはエラー

### アシスト機能
- **自動インポート整理**: 有効

## TypeScript設定
- **strict**: true (厳格モード有効)
- **target**: ES2017
- **module**: esnext
- **moduleResolution**: bundler
- **パスエイリアス**: `@/*` → `./src/*`

## Next.js設定
- **typedRoutes**: true (型安全なルーティング)
- **serverExternalPackages**: `@libsql/client`, `@libsql/isomorphic-ws`
- **serverActions.bodySizeLimit**: 5MB

## コーディング規約

### ディレクトリ構造
- **Private Folders**: `_components/`, `_actions/`, `_hooks/`, `_prompts/` などアンダースコアプレフィックスを使用
- **Parallel Routes**: `@header/` などアットマークプレフィックスを使用
- **Route Groups**: `(index)/` など丸括弧を使用

### コンポーネント命名
- Reactコンポーネント: PascalCase (例: `PublicArticles`)
- ファイル名: kebab-case (例: `public-articles.tsx`)

### Server Actions
- ファイル名: `*-action.ts` (例: `delete-article-action.ts`)
- 関数名: `*Action` (例: `deleteArticleAction`)

### Hooks
- ファイル名: `use-*.ts` (例: `use-normalize-text.ts`)
- 関数名: `use*` (例: `useNormalizeText`)

### インポート順序
Biomeが自動的に整理:
1. 外部ライブラリ
2. `@/` エイリアスのインポート
3. 相対パスのインポート

### スタイリング
- **cn関数**: `clsx` + `tailwind-merge` を組み合わせた関数を使用
- **Tailwindクラス**: 長い場合は適宜改行
- **CSS変数**: Tailwind設定で定義されたカスタムプロパティを使用