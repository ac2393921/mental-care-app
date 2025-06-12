# Mental Care App

友人のような気軽な相談相手となるメンタルヘルスケアアプリ

## 🚀 技術スタック

- **フレームワーク**: Expo + React Native + TypeScript
- **認証**: Clerk (expo-web-browser, expo-secure-store, expo-crypto)
- **データベース**: Supabase (PostgreSQL)
- **状態管理**: Zustand
- **音声機能**: Expo AV + Expo Speech

## 📦 セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator または Android Emulator（モバイル開発用）

### 1. プロジェクトのクローンと依存関係インストール
```bash
# プロジェクトディレクトリに移動
cd mental-care-app

# 依存関係のインストール（--legacy-peer-depsは必須）
npm install --legacy-peer-deps
```

### 2. 環境変数の設定
`.env.example`を参考に`.env`ファイルを作成:

```bash
cp .env.example .env
```

### 3. Supabaseセットアップ

#### 3.1. Supabaseプロジェクト作成
1. [Supabase](https://supabase.com/)にアクセス
2. 「New Project」をクリック
3. プロジェクト名: `mental-care-app`
4. データベースパスワードを設定
5. リージョンを選択（推奨: Northeast Asia (Tokyo)）

#### 3.2. データベーススキーマの実行

**初回セットアップ時**:
1. Supabaseダッシュボードの「SQL Editor」に移動
2. `supabase/schema.sql`の内容をコピー&ペースト
3. 「Run」をクリックして実行

**マイグレーション実行方法**:

データベーススキーマを更新する場合は、以下の手順に従ってください：

1. **本番環境での注意**: 必ずバックアップを取得してから実行
```bash
# Supabaseダッシュボード → Settings → Database → Database backups から手動バックアップ作成
```

2. **開発環境でのテスト**:
```sql
-- SQL Editorで新しいマイグレーションを実行前にテスト
-- 例: 新しいカラム追加の場合
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2);
```

3. **段階的マイグレーション**:
```sql
-- 1. 新しいテーブル/カラムを追加（NON-BREAKING）
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 2. インデックス追加
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 3. データ移行（必要に応じて）
UPDATE users SET preferences = '{"theme": "light"}' WHERE preferences IS NULL;

-- 4. 制約追加
ALTER TABLE messages ADD CONSTRAINT chk_content_length CHECK (char_length(content) <= 1000);
```

4. **RLS（Row Level Security）ポリシー更新**:
```sql
-- 既存ポリシーを削除して再作成
DROP POLICY IF EXISTS "users_policy" ON users;
CREATE POLICY "users_policy" ON users 
  FOR ALL USING (auth.uid() = clerk_user_id);
```

5. **マイグレーション履歴管理**:
```sql
-- マイグレーション履歴テーブル（推奨）
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(14) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- マイグレーション記録
INSERT INTO schema_migrations (version, description) 
VALUES ('20241212_001', 'Add sentiment_score to messages table');
```

6. **ロールバック用SQL準備**:
```sql
-- マイグレーション前にロールバック用SQLを準備
-- 例: カラム追加のロールバック
-- ALTER TABLE messages DROP COLUMN IF EXISTS sentiment_score;
```

**マイグレーションのベストプラクティス**:
- ✅ 本番適用前に開発環境でテスト
- ✅ バックアップ取得
- ✅ ダウンタイムが発生しない変更を優先
- ✅ 段階的にリリース（カラム追加→データ移行→制約追加）
- ✅ ロールバック手順を事前準備
- ❌ 一度に大量の変更を適用しない
- ❌ NOT NULL制約を既存データに直接追加しない

#### 3.3. 認証設定
1. 「Authentication」→「Settings」に移動
2. 「Email」プロバイダーが有効になっていることを確認
3. 「Confirm email」を無効化（開発時のみ）

#### 3.4. 環境変数の設定
1. 「Settings」→「API」に移動
2. 「Project URL」と「anon public」キーをコピー
3. `.env`ファイルに設定:
```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Clerkセットアップ

#### 4.1. Clerkプロジェクト作成
1. [Clerk](https://clerk.com/)にアクセス
2. 「Add application」をクリック
3. アプリケーション名: `Mental Care App`
4. 「React Native」を選択

#### 4.2. 認証設定
1. 「Email, Phone, Username」→「Email address」のみ有効化
2. 「Password」を有効化
3. 「Email verification」を無効化（開発時のみ）

#### 4.3. Google OAuth設定
1. 「Social providers」に移動
2. 「Google」を選択して有効化
3. Google Cloud Consoleで以下を設定：
   - [Google Cloud Console](https://console.cloud.google.com/) にアクセス
   - 新しいプロジェクトを作成または既存プロジェクトを選択
   - 「APIs & Services」→「OAuth consent screen」を設定
   - 「Credentials」→「Create Credentials」→「OAuth 2.0 Client IDs」
   - Application type: Web application
   - Authorized redirect URIs: Clerkダッシュボードに表示されるコールバックURL追加
4. Client IDとClient SecretをClerkに設定

#### 4.4. 環境変数の設定
1. 「API Keys」に移動
2. 「Publishable key」をコピー
3. `.env`ファイルに設定:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

### 5. 開発サーバー起動
```bash
npm start
```

### 6. アプリの動作確認
1. Expo Goアプリをスマートフォンにインストール
2. QRコードをスキャン、またはシミュレーターで起動
3. 新規登録画面でアカウント作成
4. ログイン機能の動作確認

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
- [x] ユーザー認証 (Clerk + Google OAuth)
- [x] 認証画面 (ログイン/サインアップ + Googleサインイン)
- [x] ナビゲーション設定
- [x] 基本チャット機能
- [x] LLMサービス統合 (OpenAI/Claude/Mock対応)
- [x] 対話履歴保存
- [x] 利用制限システム (10回/日)
- [x] 包括的テストスイート
- [ ] 音声入力

### 追加機能
- [ ] 音声読み上げ
- [ ] 感情分析・可視化
- [ ] 利用制限システム
- [ ] プレミアム機能

## 🚦 開発コマンド

```bash
# 開発サーバー起動
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web（開発用）
npm run web

# 型チェック
npx tsc --noEmit

# パッケージ更新確認
npx expo install --fix

# テスト実行
npm test              # 全テスト実行
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジ付き
npm run test:ci       # CI用実行
```

## 🔧 トラブルシューティング

### iOS Bundling失敗エラー

**症状**: `Unable to resolve "expo-web-browser" from "@clerk/clerk-expo"`

Clerkの必要な依存関係が不足している場合に発生します。

**解決方法**:
```bash
# Clerk関連の必要パッケージをインストール
npm install expo-web-browser expo-secure-store expo-crypto expo-auth-session --legacy-peer-deps

# React Navigation関連の必要パッケージもインストール
npm install react-dom react-native-gesture-handler --legacy-peer-deps
```

### Metro bundler エラー
```bash
# キャッシュクリア
npx expo start --clear

# node_modules再インストール
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### npm install時のエラー・警告について

**🚨 重要: 必ず `--legacy-peer-deps` フラグを使用してください**

依存関係の競合エラーが発生します：
```bash
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Could not resolve dependency:
npm ERR! peer react-dom@"^18.0.0 || ^19.0.0 || ^19.0.0-0" from @clerk/clerk-expo@2.13.0
```

**✅ 正しい解決方法**:
```bash
npm install --legacy-peer-deps
```

**❌ これらのコマンドは使わないでください**:
```bash
npm install           # エラーが発生
npm install --force   # 依存関係が壊れる可能性
```

**Node.js バージョン警告**:
```
npm WARN EBADENGINE Unsupported engine
```
→ Jest 30.0.0がNode.js 18.14.0+を要求するため（機能的には問題なし）

**廃止警告**:
```
npm WARN deprecated @testing-library/jest-native
```
→ テストライブラリの移行推奨（現在の機能に影響なし）

### 認証エラー
1. `.env`ファイルの環境変数を確認
2. Clerkダッシュボードでドメイン設定を確認
3. Supabaseの認証設定を確認

### 依存関係エラー（ERESOLVE）

**症状**: `npm install`で依存関係競合エラー

**原因**: React 19.0.0とreact-dom 19.1.0の間でバージョン競合

**解決手順**:
```bash
# 1. キャッシュクリア
npm cache clean --force

# 2. 古いファイル削除
rm -rf node_modules package-lock.json

# 3. legacy-peer-depsでインストール
npm install --legacy-peer-deps
```

**注意**: `--legacy-peer-deps`は必須です。これなしではインストールできません。

### テストエラー
```bash
# Jest設定の問題
npx expo install --fix

# Transform設定の問題
# jest.config.js の transformIgnorePatterns を確認
```

## 📊 データベーススキーマ

### 主要テーブル

- **`users`**: ユーザー情報（Clerk認証連携）
- **`conversations`**: 対話セッション管理
- **`messages`**: メッセージ履歴とLLM応答
- **`mood_logs`**: 感情トラッキングログ
- **`usage`**: 日次利用回数管理（フリー/プレミアム制限）
- **`schema_migrations`**: マイグレーション履歴管理（推奨）

### スキーマファイル

- **初期スキーマ**: `supabase/schema.sql`
- **マイグレーション**: 上記「Supabaseセットアップ」→「マイグレーション実行方法」を参照

### RLS（Row Level Security）設定

```sql
-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "users_policy" ON users FOR ALL USING (auth.uid() = clerk_user_id);
CREATE POLICY "conversations_policy" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "messages_policy" ON messages FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM conversations WHERE id = conversation_id)
);
```

### インデックス設定

```sql
-- パフォーマンス最適化のためのインデックス
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_usage_user_date ON usage(user_id, date);
```

## 🔒 セキュリティ

- Row Level Security (RLS) 有効
- データ暗号化
- 完全匿名対応
- Clerk認証統合