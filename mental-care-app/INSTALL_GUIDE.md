# インストールガイド - Mental Care App

## 🚨 重要な注意事項

**必ず `--legacy-peer-deps` フラグを使用してください**

このプロジェクトでは依存関係の競合により、通常の `npm install` ではインストールできません。

## 📋 インストール手順

### ステップ1: 前提条件確認
```bash
node --version  # 18以上であることを確認
npm --version   # 最新版を推奨
```

### ステップ2: プロジェクトの準備
```bash
cd mental-care-app
```

### ステップ3: 依存関係インストール
```bash
npm install --legacy-peer-deps
```

## ❗ よくあるエラーと解決方法

### エラー1: ERESOLVE競合エラー
```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Could not resolve dependency:
npm ERR! peer react-dom@"^18.0.0 || ^19.0.0 || ^19.0.0-0" from @clerk/clerk-expo@2.13.0
```

**解決方法**:
```bash
npm install --legacy-peer-deps
```

### エラー2: キャッシュ関連エラー
```
npm ERR! network request to https://registry.npmjs.org/...
```

**解決方法**:
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

### エラー3: ロックファイル競合
```
npm ERR! peer dep missing
```

**解決方法**:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 🔍 エラーの原因

### 依存関係競合の詳細
- **React**: 19.0.0 (プロジェクトで使用)
- **react-dom**: 19.1.0 (Clerkが要求)
- **@clerk/clerk-expo**: react-dom 18.0.0 || 19.0.0を期待

この微細なバージョン差により、npm の厳密な依存関係解決が失敗します。

### --legacy-peer-deps の役割
- npm v7以降の厳密な依存関係チェックを緩和
- 軽微なバージョン差を許容
- 実際の動作には影響なし

## ✅ インストール成功の確認

### 正常なインストール完了例
```bash
added 1218 packages, and audited 1219 packages in 45s

91 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### 警告は正常です
以下の警告が表示されても問題ありません：
```bash
npm WARN EBADENGINE Unsupported engine
npm WARN deprecated @testing-library/jest-native
```

## 🚀 インストール後の確認

### 開発サーバー起動テスト
```bash
npm start
```

### 型チェック
```bash
npx tsc --noEmit
```

### テスト実行
```bash
npm test
```

## 💡 開発のヒント

### package.json変更後
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 新しいパッケージ追加時
```bash
npm install <package-name> --legacy-peer-deps
```

### キャッシュクリア推奨
```bash
npm cache clean --force
npx expo start --clear
```

## 🆘 それでも問題が解決しない場合

1. **Node.js バージョン確認**: 18.14.0以上を使用
2. **npm バージョン更新**: `npm install -g npm@latest`
3. **Expo CLI更新**: `npm install -g @expo/cli@latest`
4. **完全リセット**:
```bash
rm -rf node_modules package-lock.json ~/.npm
npm cache clean --force
npm install --legacy-peer-deps
```

## 📞 サポート

インストールに関する問題は、プロジェクトのREADME.mdのトラブルシューティングセクションを参照してください。