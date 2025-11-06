# 開発環境構築

Madaminalinkのローカル開発環境をセットアップする手順を解説します。

## 📋 目次

- [前提条件](#前提条件)
- [環境構築手順](#環境構築手順)
- [Discord Bot の作成](#discord-botの作成)
- [開発サーバーでのテスト](#開発サーバーでのテスト)
- [よくある問題](#よくある問題)

---

## 前提条件

### 必須ソフトウェア

開発には以下のいずれかのランタイムが必要です：

#### オプション1: Bun（推奨）

```bash
# Bunのインストール（Linux/macOS）
curl -fsSL https://bun.sh/install | bash

# バージョン確認
bun --version
```

**推奨理由:**
- 高速な起動時間
- TypeScriptをそのまま実行可能
- パッケージインストールが高速

#### オプション2: Node.js

```bash
# Node.js 16以上が必要
node --version  # v16.0.0 以上
npm --version
```

[公式サイト](https://nodejs.org/)からダウンロードしてインストール。

---

### データベース

#### オプション1: Docker（推奨）

```bash
# Dockerのインストール確認
docker --version
docker-compose --version
```

Dockerがない場合は [公式ガイド](https://docs.docker.com/get-docker/) を参照してインストール。

#### オプション2: ローカルMongoDB

```bash
# MongoDBのインストール（Ubuntu/Debian）
sudo apt-get install -y mongodb

# MongoDBの起動
sudo systemctl start mongodb

# 動作確認
mongosh
```

---

### 開発ツール

- **Git** - バージョン管理
- **テキストエディタ** - VS Code推奨（TypeScript IntelliSense対応）

---

## 環境構築手順

### ステップ1: リポジトリのクローン

```bash
# GitHubからクローン
git clone https://github.com/minarin0179/Madaminalink_v2.git
cd Madaminalink_v2
```

---

### ステップ2: 依存関係のインストール

#### Bunを使用する場合

```bash
bun install
```

#### npmを使用する場合

```bash
npm install
```

**インストールされるパッケージ:**
- discord.js
- mongoose
- agenda
- dotenv
- その他（package.json参照）

---

### ステップ3: 環境変数の設定

`.env` ファイルを作成します：

```bash
# .env.sample をコピー
cp .env.sample .env
```

`.env` を編集：

```bash
# Discord Bot トークン
TOKEN=YOUR_BOT_TOKEN_HERE

# 開発サーバーID（後述）
DEV_SERVER_ID=YOUR_GUILD_ID_HERE

# MongoDBの接続先
MONGODB=mongodb://localhost:27017

# タイムゾーン
TZ=Asia/Tokyo
```

**各変数の説明:**

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `TOKEN` | Discord Bot のトークン | `MTIzNDU2Nzg5...` |
| `DEV_SERVER_ID` | 開発用サーバーのID（省略可） | `123456789012345678` |
| `MONGODB` | MongoDBの接続URI | `mongodb://localhost:27017` |
| `TZ` | タイムゾーン（リマインダー用） | `Asia/Tokyo` |

---

### ステップ4: MongoDBの起動

#### Dockerを使用する場合（推奨）

```bash
# docker-compose.ymlを使用してMongoDB起動
docker-compose up -d mongodb

# 起動確認
docker-compose ps
```

**`.env` の設定（Docker使用時）:**
```
MONGODB=mongodb://mongodb:27017
```

#### ローカルMongoDBを使用する場合

```bash
# MongoDBを起動
sudo systemctl start mongodb

# 動作確認
mongosh
```

**`.env` の設定（ローカルMongoDB）:**
```
MONGODB=mongodb://localhost:27017
```

---

### ステップ5: TypeScriptのビルド（オプション）

Bunを使用する場合は不要ですが、Node.jsの場合はビルドが必要です：

```bash
# TypeScriptをJavaScriptにコンパイル
npx tsc

# dist/ ディレクトリに出力される
```

---

### ステップ6: Bot の起動

#### 開発モード（単一プロセス、ホットリロード）

```bash
# Bunを使用
bun run dev

# npmを使用
npm run dev
```

このコマンドは `src/bot.ts` を直接実行します（シャーディングなし）。

---

#### 本番モード（シャーディング対応）

```bash
# Bunを使用
bun run start

# npmを使用
npm run start
```

このコマンドは `src/index.ts` を実行し、シャーディングマネージャーが起動します。

---

### ステップ7: 動作確認

Bot がオンラインになったら、Discordで以下を実行：

```
/ping
```

レスポンスが返ってきたら成功です！

---

## Discord Bot の作成

### ステップ1: Discord Developer Portal へアクセス

[Discord Developer Portal](https://discord.com/developers/applications) にアクセスし、ログイン。

---

### ステップ2: 新しいアプリケーションを作成

1. 「New Application」をクリック
2. アプリケーション名を入力（例: `Madaminalink Dev`）
3. 「Create」をクリック

---

### ステップ3: Bot アカウントを作成

1. 左メニューから「Bot」を選択
2. 「Add Bot」をクリック
3. 「Yes, do it!」で確認

---

### ステップ4: Bot トークンを取得

1. 「TOKEN」セクションで「Reset Token」をクリック
2. トークンをコピー
3. `.env` ファイルの `TOKEN` に貼り付け

⚠️ **警告:** トークンは絶対に公開しないでください！

---

### ステップ5: 必要な Intents を有効化

「Bot」ページで以下を有効化：

- ✅ **PRESENCE INTENT** (オプション)
- ✅ **SERVER MEMBERS INTENT** （必須）
- ✅ **MESSAGE CONTENT INTENT** （必須）

「Save Changes」をクリック。

---

### ステップ6: OAuth2 設定

1. 左メニューから「OAuth2」→「URL Generator」を選択
2. **SCOPES** で以下を選択：
   - ✅ `bot`
   - ✅ `applications.commands`

3. **BOT PERMISSIONS** で以下を選択：
   - ✅ Administrator（開発時は推奨）
   - または個別の権限を選択：
     - Manage Channels
     - Manage Roles
     - Read Messages/View Channels
     - Send Messages
     - Manage Messages
     - Embed Links
     - Attach Files
     - Read Message History
     - Use Slash Commands
     - Connect (Voice)
     - Move Members (Voice)

4. 下部の「GENERATED URL」をコピー

---

### ステップ7: Bot をサーバーに招待

1. コピーしたURLをブラウザで開く
2. 開発用サーバーを選択
3. 「認証」をクリック

Bot がサーバーに参加します。

---

### ステップ8: サーバーIDの取得

1. Discordで「ユーザー設定」→「詳細設定」→「開発者モード」を有効化
2. サーバーを右クリック→「IDをコピー」
3. `.env` の `DEV_SERVER_ID` に貼り付け

**DEV_SERVER_ID の役割:**
- 開発専用のコマンドを特定サーバーにのみ登録
- グローバルコマンドと分離して管理

---

## 開発サーバーでのテスト

### コマンドの登録

Bot を起動すると、自動的にスラッシュコマンドが登録されます。

- `DEV_SERVER_ID` が設定されている場合 → そのサーバーにのみ登録（即時反映）
- 設定されていない場合 → グローバルに登録（反映に最大1時間）

---

### デバッグモード

コンソール出力を確認しながら開発：

```bash
# Bunでデバッグ
bun run dev

# 詳細なログを出力する場合
DEBUG=* bun run dev
```

---

### ホットリロード

ファイルを変更したら、Bot を再起動：

```bash
# Ctrl+C で停止
# 再度起動
bun run dev
```

**ヒント:** `nodemon` や `bun --watch` を使用すると、ファイル変更時に自動再起動できます：

```bash
# package.json に追加
"scripts": {
    "dev:watch": "bun --watch src/bot.ts"
}

# 実行
bun run dev:watch
```

---

## よくある問題

### Q1. `TOKEN is invalid` エラー

**原因:** `.env` のトークンが正しくない、または漏洩してリセットされた。

**解決策:**
1. Discord Developer Portal でトークンをリセット
2. 新しいトークンを `.env` にコピー

---

### Q2. `Missing Access` エラー

**原因:** Bot に必要な権限がない。

**解決策:**
1. サーバー設定 → ロール で Bot のロールを確認
2. 必要な権限を付与
3. または Bot を再招待（管理者権限付き）

---

### Q3. スラッシュコマンドが表示されない

**原因:**
- Bot 招待時に `applications.commands` スコープを含めていない
- コマンド登録に時間がかかっている

**解決策:**
1. Bot を再招待（正しいスコープで）
2. `DEV_SERVER_ID` を設定してローカルサーバーでテスト
3. Discordクライアントを再起動

---

### Q4. MongoDB接続エラー

**原因:** MongoDBが起動していない、または接続先が間違っている。

**解決策:**

```bash
# Docker使用時
docker-compose up -d mongodb

# ローカルMongoDB使用時
sudo systemctl start mongodb

# 接続確認
mongosh
```

`.env` の `MONGODB` が正しいか確認。

---

### Q5. `MODULE_NOT_FOUND` エラー

**原因:** 依存関係がインストールされていない。

**解決策:**

```bash
# 再インストール
bun install
# または
npm install

# node_modules を削除して再インストール
rm -rf node_modules
bun install
```

---

### Q6. TypeScript エラー

**原因:** 型定義が古い、または tsconfig.json が正しくない。

**解決策:**

```bash
# 型定義を更新
bun add -d @types/node @types/mongoose

# TypeScriptをクリーンビルド
rm -rf dist
npx tsc
```

---

## 開発ワークフロー

### 推奨ディレクトリ構造

```
Madaminalink_v2/
├── src/              # 開発中のコード
├── dist/             # ビルド済みコード（gitignore）
├── .env              # 環境変数（gitignore）
├── .env.sample       # テンプレート
└── node_modules/     # 依存関係（gitignore）
```

---

### コードスタイル

プロジェクトは ESLint + Prettier を使用しています：

```bash
# コードフォーマット
npx prettier --write src/

# リント実行
npx eslint src/

# 自動修正
npx eslint src/ --fix
```

**VS Code 拡張機能（推奨）:**
- ESLint
- Prettier - Code formatter
- TypeScript and JavaScript Language Features

---

### ブランチ戦略

開発時は feature ブランチを作成：

```bash
# 新機能用ブランチ作成
git checkout -b feature/my-new-command

# 開発・コミット
git add .
git commit -m "Add my new command"

# プッシュ
git push origin feature/my-new-command
```

---

## 次のステップ

- [アーキテクチャ](./architecture.md) でコードベースの構造を理解
- [APIリファレンス](./api-reference.md) で各クラスの使い方を学習
- [コントリビューション](./contributing.md) でプロジェクトへの貢献方法を確認

---

## 📖 参考リンク

- [Discord.js ドキュメント](https://discord.js.org/)
- [Mongoose ドキュメント](https://mongoosejs.com/)
- [Bun ドキュメント](https://bun.sh/docs)
- [Discord Developer Portal](https://discord.com/developers/docs)
