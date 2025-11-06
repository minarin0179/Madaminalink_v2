# デプロイガイド

Madaminalinkを本番環境にデプロイする方法を解説します。

## 📋 目次

- [デプロイ方法の選択](#デプロイ方法の選択)
- [Docker を使用したデプロイ](#dockerを使用したデプロイ)
- [PM2 を使用したデプロイ](#pm2を使用したデプロイ)
- [クラウドサービスへのデプロイ](#クラウドサービスへのデプロイ)
- [本番環境の設定](#本番環境の設定)
- [監視とメンテナンス](#監視とメンテナンス)

---

## デプロイ方法の選択

### 推奨デプロイ方法

| 方法 | 推奨度 | メリット | デメリット |
|------|--------|----------|-----------|
| **Docker Compose** | ⭐⭐⭐⭐⭐ | 簡単、再現性高い、MongoDB込み | Docker の知識が必要 |
| **PM2** | ⭐⭐⭐⭐ | 軽量、自動再起動、ログ管理 | MongoDB を別途セットアップ |
| **systemd** | ⭐⭐⭐ | OS標準、信頼性高い | 設定が複雑 |
| **手動実行** | ⭐ | 最もシンプル | 本番運用には不向き |

**推奨:** 初めての場合は **Docker Compose** を使用することを強く推奨します。

---

## Docker を使用したデプロイ

### 前提条件

- Docker 20.10+
- Docker Compose 1.29+

```bash
# バージョン確認
docker --version
docker-compose --version
```

---

### ステップ1: リポジトリのクローン

```bash
git clone https://github.com/minarin0179/Madaminalink_v2.git
cd Madaminalink_v2
```

---

### ステップ2: 環境変数の設定

`.env` ファイルを作成：

```bash
cp .env.sample .env
nano .env  # または vim, code など
```

`.env` の内容：

```bash
# Discord Bot Token
TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE

# 開発サーバーID（本番では省略可）
DEV_SERVER_ID=

# MongoDB接続先（Docker Composeの場合）
MONGODB=mongodb://mongo:27017

# タイムゾーン
TZ=Asia/Tokyo
```

⚠️ **重要:** `.env` ファイルは `.gitignore` に含まれています。絶対にコミットしないでください。

---

### ステップ3: Docker イメージのビルド

#### オプション1: 公式イメージを使用（推奨）

```bash
docker-compose pull
```

#### オプション2: ローカルでビルド

`docker-compose.yml` を編集：

```yaml
services:
  bot:
    build: .  # image: の代わりにこれを使用
    container_name: madaminalink
    # ...
```

ビルド実行：

```bash
docker-compose build
```

---

### ステップ4: コンテナの起動

```bash
# バックグラウンドで起動
docker-compose up -d

# ログを確認
docker-compose logs -f bot
```

**期待される出力:**

```
madaminalink    | [INFO] Bot is ready!
madaminalink    | [INFO] Logged in as Madaminalink#1234
```

---

### ステップ5: 動作確認

Discordで `/ping` コマンドを実行し、応答があれば成功です。

---

### Docker Compose の管理コマンド

```bash
# コンテナの起動
docker-compose up -d

# コンテナの停止
docker-compose down

# コンテナの再起動
docker-compose restart bot

# ログの確認
docker-compose logs -f bot

# ログの全履歴を表示
docker-compose logs bot

# コンテナの状態確認
docker-compose ps

# MongoDBのシェルに接続
docker-compose exec mongo mongosh
```

---

### アップデート手順

```bash
# 最新コードを取得
git pull origin main

# コンテナを再ビルド＆再起動
docker-compose down
docker-compose build
docker-compose up -d

# または、公式イメージを使用している場合
docker-compose pull
docker-compose up -d
```

---

## PM2 を使用したデプロイ

PM2は軽量なプロセスマネージャーで、Node.js/Bunアプリの本番運用に最適です。

### 前提条件

- Bun または Node.js
- MongoDB（別途インストール）

---

### ステップ1: MongoDB のインストール

#### Ubuntu/Debian

```bash
# MongoDBのインストール
sudo apt-get update
sudo apt-get install -y mongodb

# 起動
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 動作確認
mongosh
```

#### macOS (Homebrew)

```bash
brew install mongodb-community
brew services start mongodb-community
```

---

### ステップ2: Bun のインストール

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # または ~/.zshrc
```

---

### ステップ3: PM2 のインストール

```bash
npm install -g pm2
```

---

### ステップ4: リポジトリのセットアップ

```bash
git clone https://github.com/minarin0179/Madaminalink_v2.git
cd Madaminalink_v2

# 依存関係のインストール
bun install

# 環境変数の設定
cp .env.sample .env
nano .env
```

`.env` の設定（PM2の場合）:

```bash
TOKEN=YOUR_BOT_TOKEN
MONGODB=mongodb://localhost:27017
TZ=Asia/Tokyo
```

---

### ステップ5: PM2 で起動

```bash
# PM2設定ファイルを使用して起動
bun pm2 start Madaminalink_pm2.config.js

# または、直接起動
pm2 start src/index.ts --interpreter ~/.bun/bin/bun --name madaminalink
```

---

### ステップ6: 起動スクリプトの設定

サーバー再起動時に自動起動するように設定：

```bash
# PM2のスタートアップスクリプトを生成
pm2 startup

# 表示されたコマンドを実行（sudoが必要な場合あり）
# 例: sudo env PATH=$PATH:/root/.bun/bin pm2 startup systemd -u root --hp /root

# 現在のプロセスを保存
pm2 save
```

---

### PM2 の管理コマンド

```bash
# プロセスの状態確認
pm2 status

# ログの表示
pm2 logs madaminalink

# プロセスの再起動
pm2 restart madaminalink

# プロセスの停止
pm2 stop madaminalink

# プロセスの削除
pm2 delete madaminalink

# モニタリング
pm2 monit
```

---

### アップデート手順（PM2）

```bash
# 最新コードを取得
git pull origin main

# 依存関係を更新
bun install

# プロセスを再起動
pm2 restart madaminalink
```

---

## クラウドサービスへのデプロイ

### AWS (EC2)

#### ステップ1: EC2 インスタンスの起動

1. AWS EC2 コンソールでインスタンスを作成
2. 推奨スペック:
   - インスタンスタイプ: t2.micro（無料枠）～ t2.small
   - OS: Ubuntu 22.04 LTS
   - ストレージ: 10GB以上

---

#### ステップ2: セキュリティグループの設定

- **インバウンドルール:**
  - SSH (22) - 自分のIPのみ許可
  - HTTPS (443) - 任意（Web ダッシュボード用、オプション）

- **アウトバウンドルール:**
  - すべて許可（Discord API への接続に必要）

---

#### ステップ3: SSH 接続

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

#### ステップ4: 環境構築

```bash
# システムアップデート
sudo apt-get update && sudo apt-get upgrade -y

# Dockerのインストール
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Docker Composeのインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 再ログイン
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

#### ステップ5: Bot のデプロイ

```bash
git clone https://github.com/minarin0179/Madaminalink_v2.git
cd Madaminalink_v2

# 環境変数の設定
nano .env

# 起動
docker-compose up -d
```

---

### Google Cloud Platform (GCE)

GCEの手順はEC2とほぼ同様です：

1. Compute Engine でVMインスタンスを作成
2. Ubuntu 22.04 を選択
3. ファイアウォールルールを設定
4. SSH接続後、上記のDocker手順を実行

---

### Heroku（非推奨）

⚠️ **注意:** HerokuはDocker Composeに対応していないため、MongoDBの設定が複雑です。MongoDB Atlasなどの外部サービスを使用する必要があります。

---

### Railway / Render

これらのPaaSは簡単にデプロイできますが、MongoDB Atlasなどの外部DBサービスが必要です。

---

## 本番環境の設定

### 環境変数のベストプラクティス

本番環境では以下を設定してください：

```bash
# .env
TOKEN=YOUR_PRODUCTION_BOT_TOKEN
MONGODB=mongodb://mongo:27017  # または MongoDB Atlas のURI
TZ=Asia/Tokyo
NODE_ENV=production  # 重要
```

---

### MongoDB のバックアップ

#### 自動バックアップスクリプト

`backup.sh` を作成：

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# MongoDBをバックアップ
docker-compose exec -T mongo mongodump --archive > $BACKUP_DIR/backup_$DATE.archive

# 7日以上前のバックアップを削除
find $BACKUP_DIR -name "backup_*.archive" -mtime +7 -delete

echo "Backup completed: backup_$DATE.archive"
```

実行権限を付与：

```bash
chmod +x backup.sh
```

cron で定期実行：

```bash
# crontabを編集
crontab -e

# 毎日午前3時にバックアップ
0 3 * * * /path/to/Madaminalink_v2/backup.sh
```

---

#### バックアップからの復元

```bash
# Docker環境の場合
docker-compose exec -T mongo mongorestore --archive < ./backups/backup_20241225_030000.archive

# ローカルMongoDBの場合
mongorestore --archive=./backups/backup_20241225_030000.archive
```

---

### セキュリティ対策

#### 1. ファイアウォールの設定

```bash
# UFWを有効化（Ubuntu）
sudo ufw enable

# SSH のみ許可
sudo ufw allow 22/tcp

# 状態確認
sudo ufw status
```

#### 2. SSH鍵認証の使用

パスワード認証を無効化：

```bash
sudo nano /etc/ssh/sshd_config
```

以下を設定：

```
PasswordAuthentication no
PubkeyAuthentication yes
```

SSH再起動：

```bash
sudo systemctl restart ssh
```

#### 3. 定期的なアップデート

```bash
# セキュリティアップデートの自動インストール
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 監視とメンテナンス

### ログの確認

#### Docker

```bash
# リアルタイムログ
docker-compose logs -f bot

# 最新100行
docker-compose logs --tail=100 bot
```

#### PM2

```bash
# リアルタイムログ
pm2 logs madaminalink

# ログファイルの場所
~/.pm2/logs/
```

---

### パフォーマンス監視

#### Docker Stats

```bash
docker stats madaminalink
```

出力例:

```
CONTAINER ID   NAME          CPU %     MEM USAGE / LIMIT   MEM %
abc123         madaminalink  2.5%      150MiB / 1GiB       14.6%
```

#### PM2 Monitoring

```bash
pm2 monit
```

---

### アラート設定（オプション）

#### Uptime Robot

1. [Uptime Robot](https://uptimerobot.com/) に登録
2. HTTP(S)モニターを作成
3. Bot のヘルスチェックエンドポイントを監視

#### Discord Webhook

エラー時にDiscordに通知する設定：

```typescript
// src/events/error.ts
client.on('error', async (error) => {
    console.error('Discord client error:', error)

    // Webhook で通知（オプション）
    const webhookUrl = process.env.ERROR_WEBHOOK_URL
    if (webhookUrl) {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `⚠️ Bot Error: ${error.message}`
            })
        })
    }
})
```

---

### 定期メンテナンス

#### 毎週

- [ ] ログの確認（エラーの有無）
- [ ] ディスク使用量の確認
- [ ] MongoDBのバックアップ確認

#### 毎月

- [ ] システムアップデート
- [ ] Botの最新版へのアップデート
- [ ] 不要なログの削除

#### 四半期ごと

- [ ] セキュリティ監査
- [ ] パフォーマンスチューニング
- [ ] バックアップの復元テスト

---

## トラブルシューティング

### Bot が起動しない

#### 1. ログを確認

```bash
# Docker
docker-compose logs bot

# PM2
pm2 logs madaminalink
```

#### 2. よくあるエラー

| エラー | 原因 | 解決策 |
|--------|------|--------|
| `TOKEN is invalid` | トークンが間違っている | `.env`のTOKENを確認 |
| `MongoServerError: connect ECONNREFUSED` | MongoDBに接続できない | MongoDBの起動を確認 |
| `Missing Intents` | Intentが有効化されていない | Discord Developer PortalでIntentを有効化 |

---

### メモリ不足

Bot がメモリ不足でクラッシュする場合：

#### スワップの設定（EC2など）

```bash
# 2GBのスワップファイルを作成
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永続化
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

### ディスク容量不足

```bash
# ディスク使用量確認
df -h

# Dockerの不要イメージを削除
docker system prune -a

# ログのローテーション設定
docker-compose down
nano docker-compose.yml
```

`docker-compose.yml` にログ設定を追加：

```yaml
services:
  bot:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 📖 関連ドキュメント

- [アーキテクチャ](./architecture.md) - システム設計
- [開発環境構築](./setup.md) - ローカル開発のセットアップ
- [コントリビューション](./contributing.md) - プロジェクトへの貢献
