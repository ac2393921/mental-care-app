# Mental Care App

友人のような気軽な相談相手となるメンタルヘルスケアアプリ

## 🚀 技術スタック

- **フレームワーク**: Expo + React Native + TypeScript
- **認証**: Clerk
- **データベース**: Supabase (PostgreSQL)
- **状態管理**: Zustand
- **音声機能**: Expo AV + Expo Speech

## 📦 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.example`を`.env`にコピーして、必要な環境変数を設定してください。

```bash
cp .env.example .env
```

### 3. Supabaseセットアップ
1. [Supabase](https://supabase.io)でプロジェクトを作成
2. `supabase/schema.sql`のスキーマを実行
3. `.env`にSupabaseのURLとキーを設定

### 4. Clerkセットアップ
1. [Clerk](https://clerk.dev)でプロジェクトを作成
2. `.env`にClerkの公開キーを設定

## 🏗️ プロジェクト構造

```
src/
├── components/       # 再利用可能なコンポーネント
├── screens/         # 画面コンポーネント
├── services/        # API・データベースサービス
├── types/           # TypeScript型定義
├── hooks/           # カスタムフック
├── stores/          # Zustand状態管理
├── utils/           # ユーティリティ関数
└── constants/       # 定数・設定
```

## 🎯 主要機能

### MVP機能
- [x] プロジェクトセットアップ
- [x] データベーススキーマ
- [ ] ユーザー認証 (Clerk)
- [ ] 基本チャット機能
- [ ] 音声入力
- [ ] 対話履歴保存

### 追加機能
- [ ] 音声読み上げ
- [ ] 感情分析・可視化
- [ ] 利用制限システム
- [ ] プレミアム機能

## 🚦 開発コマンド

```bash
# 開発サーバー起動
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📊 データベーススキーマ

主要テーブル:
- `users`: ユーザー情報
- `conversations`: 対話セッション
- `messages`: メッセージ履歴  
- `mood_logs`: 感情ログ
- `usage`: 利用回数管理

## 🔒 セキュリティ

- Row Level Security (RLS) 有効
- データ暗号化
- 完全匿名対応
- Clerk認証統合