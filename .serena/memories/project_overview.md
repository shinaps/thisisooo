# プロジェクト概要

## プロジェクト名
**thisisooo** (this is ◯◯◯)

## 目的
AIがあらゆるテーマでインタビュー記事を自動生成するサービス。

## 主要機能
1. **インタビュー機能**: AIとの対話形式でインタビューを実施
2. **記事生成機能**: インタビュー内容から記事を自動生成
3. **記事管理**: 記事の公開/非公開、編集、削除
4. **ユーザープロフィール管理**: プロフィール編集、ユーザー削除
5. **認証機能**: Google OAuth + Email/Password認証

## インタビューテーマ
- career (キャリア)
- hobby (趣味)
- favoriteArtist (好きなアーティスト)
- favoriteBook (好きな本)
- favoriteMovie (好きな映画)
- favoriteGame (好きなゲーム)
- recentRestaurant (最近行ったレストラン)
- selfIntroduction (自己紹介)
- product (プロダクト)
- thoughtReason (考えた理由)

## デプロイ環境
- **開発環境**: ローカル + プレビュー環境
- **ステージング**: stg.thisis.ooo
- **本番環境**: thisis.ooo

すべてCloudflare Workers上で動作するNext.js 15アプリケーション。