# マダミナリンク (Madaminalink)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue)](https://www.typescriptlang.org/)
[![discord.js](https://img.shields.io/badge/discord.js-7289da)](https://discord.js.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](docker-compose.yml)
[![Documentation](https://img.shields.io/badge/docs-docs.madaminalink.com-green)](https://docs.madaminalink.com)

> マーダーミステリーをDiscord上で行う際にGMを支援する多機能Bot

## 概要

マダミナリンクは、マーダーミステリーのゲーム進行をサポートするDiscord Botです。チャンネル・ロールの自動セットアップ、進行管理、ログ保存など、GMの負担を軽減する各種コマンドを提供します。Discord.jsとBunを使用したTypeScriptプロジェクトです。

## 主要機能

- **セットアップ自動化**: プレイ用チャンネル・ロールを一括作成
- **進行管理**: ダイスロール、投票集計、リマインダー設定など
- **ログ保存**: カテゴリーをスレッド化、メッセージ転送
- **クリーンアップ**: メッセージ一括削除、チャンネル一括削除
- **権限管理**: 公開ボタン設置、ロール付け外しボタン設置

詳細は[ドキュメント](https://docs.madaminalink.com/commands/)を参照してください。

## ユーザー向けリンク

- 📚 [ドキュメント](https://docs.madaminalink.com) - 全コマンドの詳細な使い方
- 🤖 [Botを招待](https://discord.com/api/oauth2/authorize?client_id=926051893728403486&permissions=8&scope=bot%20applications.commands) - サーバーに追加
- 💬 [サポートサーバー](https://discord.gg/JMqcQstFSK) - 不具合報告・質問
- 💰 [支援 (FANBOX)](https://minarin0179.fanbox.cc/) - 開発支援

## 開発環境

### 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Runtime | [Bun](https://bun.sh/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Framework | [discord.js](https://discord.js.org/) |
| Database | [MongoDB](https://www.mongodb.com/) ([mongoose](https://mongoosejs.com/)) |
| Scheduler | [agenda](https://github.com/agenda/agenda) |
| Process Manager | [PM2](https://pm2.keymetrics.io/) |
| Container | Docker, DevContainer |
| Documentation | [VitePress](https://vitepress.dev/) |

### 必要要件

- Bun
- Docker & Docker Compose
- Discord Bot Token（[Discord Developer Portal](https://discord.com/developers/applications)で取得）

### セットアップ

#### 1. DevContainer（推奨）

VSCode + Dev Containersで自動的にセットアップされます。

1. リポジトリをクローン
2. VSCodeで開く
3. 「Reopen in Container」を選択
4. `.env`ファイルが自動生成されるので、`TOKEN`と`DEV_SERVER_ID`を設定

#### 2. Docker Compose

```bash
# 開発環境の起動
docker compose -f .devcontainer/docker-compose.dev.yml up
```

#### 3. ローカル環境

```bash
# 依存関係のインストール
bun install

# 環境変数ファイルの作成
cp .env.sample .env

# .envを編集してTOKENとDEV_SERVER_IDを設定
# TOKEN=<YOUR_BOT_TOKEN>
# DEV_SERVER_ID=<DISCORD_SERVER_ID>
# MONGODB=mongodb://mongodb:27017
# TZ=Asia/Tokyo

# Bot起動
bun run dev
```

### 開発コマンド

| コマンド | 説明 |
|---------|------|
| `bun run dev` | Bot開発サーバーを起動（ホットリロード） |
| `bun run start` | 本番モードでBot起動 |
| `bun run demon` | PM2でBot起動（プロセス管理） |
| `bun run docs:dev` | ドキュメント開発サーバー起動（[http://localhost:5173](http://localhost:5173)） |
| `bun run docs:build` | ドキュメントをビルド |
| `bun run docs:preview` | ビルド済みドキュメントをプレビュー |
| `bun run releases:generate` | リリースノート生成 |

## プロジェクト構造

```
Madaminalink_v2/
├── src/                      # Botソースコード
│   ├── commands/             # Discordスラッシュコマンド
│   │   ├── slashcommands/    # /setup, /archive等のコマンド実装
│   │   └── contextmenu/      # コンテキストメニューコマンド
│   ├── components/           # ボタン、モーダル等のUIコンポーネント
│   ├── events/               # Discordイベントハンドラ
│   ├── structures/           # 基底クラス、型定義
│   ├── utils/                # ユーティリティ関数
│   ├── bot.ts                # Bot本体
│   ├── index.ts              # エントリポイント
│   └── agenda.ts             # スケジューラー設定
├── docs/                     # VitePressユーザーガイド
│   ├── .vitepress/           # VitePress設定
│   ├── guide/                # 導入ガイド
│   ├── commands/             # 各コマンドの詳細ドキュメント
│   └── legal/                # プライバシーポリシー、利用規約
├── .devcontainer/            # DevContainer設定
├── .github/workflows/        # CI/CD定義
├── scripts/                  # 自動化スクリプト
├── Dockerfile                # 本番用Dockerイメージ
├── docker-compose.yml        # 本番環境設定
└── Madaminalink_pm2.config.js # PM2設定
```

## コントリビューション

### 開発フロー

1. Issueの作成または既存Issueの選択
2. フィーチャーブランチ作成（`feature/xxx`または`fix/xxx`）
3. 実装とコミット
4. PRの作成
5. レビュー後、`main`にマージ

### CI/CD

本プロジェクトではGitHub Actionsで自動化されています。

| ワークフロー | トリガー | 処理内容 |
|------------|---------|---------|
| **deploy.yml** | `main`へのpush（`docs/**`除外） | Dockerイメージをビルド→Docker Hubにpush→本番環境に自動デプロイ |
| **docs.yml** | `main`の`docs/**`変更 | VitePressでドキュメントをビルド→GitHub Pagesにデプロイ |
| **update-docs.yml** | `main`の`src/**`変更 | Claude Codeがソースコードを解析→ドキュメントを自動更新→ドラフトPR作成 |
| **restart.yml** | 手動トリガー | 本番環境のBotを再起動 |

### コーディング規約

- **Linter/Formatter**: ESLint + Prettier設定済み（自動フォーマット有効）
- **コメント**: 日本語で記述（[.github/copilot-instructions.md](.github/copilot-instructions.md)参照）
- **ファイル末尾**: 改行を挿入
- **厳格モード**: TypeScript strictモード有効

## ライセンス

MIT License - [LICENSE](LICENSE)
