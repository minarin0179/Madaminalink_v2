---
paths: docs/**/*
---

# ドキュメント作成ガイド

このドキュメントは、マダミナリンクのユーザーガイドをVitePressで構築する際の設計思想と構成についてまとめたものです。

## プロジェクト概要

- **プロジェクト名**: マダミナリンク (Madaminalink)
- **種類**: マーダーミステリー向けDiscord Bot
- **ドキュメントサイト**: `https://docs.madaminalink.com`
- **フレームワーク**: VitePress v1.6.4
- **言語**: 日本語

## ディレクトリ構成

```
docs/
├── .vitepress/
│   ├── config.mts              # VitePress設定（SEO、構造化データ含む）
│   ├── commands.data.mts       # コマンドメタデータローダー
│   ├── commandsSidebar.mts     # サイドバー設定
│   ├── generateOgImages.mts    # OGP画像生成スクリプト
│   └── theme/
│       ├── index.ts            # カスタムテーマ設定
│       └── components/
│           ├── PageHeader.vue  # ページヘッダーコンポーネント
│           └── CommandList.vue # コマンド一覧コンポーネント
├── public/
│   ├── CNAME                   # カスタムドメイン設定
│   ├── favicon.ico             # ファビコン
│   ├── favicon-*.png           # 各サイズのファビコン
│   ├── apple-touch-icon.png    # Apple Touch Icon
│   └── images/
│       └── common/
│           └── icon.png        # サイトアイコン（OGP、ロゴ用）
├── images/                     # ページ固有の画像
│   ├── guide/
│   │   └── getting-started/    # 導入ガイド用画像
│   └── commands/               # コマンド説明用画像（今後追加）
├── guide/
│   └── getting-started.md      # 導入ガイド
├── commands/
│   ├── index.md                # コマンド一覧（CommandListコンポーネント使用）
│   ├── _template.md            # コマンドページのテンプレート
│   └── [コマンド名].md         # 各コマンドの詳細ページ
├── legal/
│   ├── privacy-policy.md       # プライバシーポリシー
│   └── terms.md                # 利用規約
├── index.md                    # トップページ
├── releases.md                 # リリースノート（自動生成）
└── .gitignore                  # VitePress固有の除外設定
```

## 設計思想

### 1. ユーザー中心の構成

ドキュメントは以下のセクションに分かれています：

| セクション | 目的 | 対象ユーザー |
|-----------|------|--------------|
| **はじめに** (`/guide/`) | Botの導入方法、基本的な使い方 | 初めて使うユーザー |
| **コマンド一覧** (`/commands/`) | 各コマンドの詳細な使い方 | 実際に使っているユーザー |
| **リリースノート** (`/releases`) | 更新履歴 | すべてのユーザー |
| **法的情報** (`/legal/`) | プライバシーポリシー、利用規約 | すべてのユーザー |
| **トップページ** (`/`) | 全体像の把握、主要機能の紹介 | すべてのユーザー |

### 2. コマンドのカテゴリ分け

コマンドはゲーム進行フローに沿って以下のカテゴリに分類されています（`commandsSidebar.mts`で定義）：

- **事前準備**: `/setup`, `/role`, `/copy`, `/transfer`, `/open`, `/remind`
- **進行管理**: `/dice`, `/poll`, `/order`, `/gather`
- **事後処理**: `/cleanup`, `/delete`, `/rename`, `/sync`, `/archive`, `/log`
- **その他**: `/ping`, `/server`, `/profile`

### 3. テンプレートベースのコンテンツ作成

新しいコマンドページを作成する際は、`docs/commands/_template.md` を参考にしてください。

テンプレートには以下のセクションが含まれています：

```markdown
---
title: /コマンド名
description: コマンドの説明
---
<PageHeader />

## 使用方法
## オプション
## 使用例
## ユースケース
## 注意事項
## よくある質問
## 関連コマンド
```

## VitePress設定の重要ポイント

### 日本語対応

`docs/.vitepress/config.mts` では、すべてのUIテキストを日本語化しています：

- 検索ボタン、目次、ナビゲーション
- 前後のページリンク
- 最終更新日表示

### リンク切れチェック

```typescript
ignoreDeadLinks: false
```

リンク切れはビルドエラーになります。すべてのリンクが有効であることを確認してください。

### ビルド除外

```typescript
srcExclude: ['**/_template.md']
```

テンプレートファイルはビルドから除外されます。

### サイドバー構成

サイドバーは`commandsSidebar.mts`で一元管理されています。新しいコマンドページを追加する際は、このファイルの適切なカテゴリに追加してください。

## カスタムコンポーネント

### PageHeader

ページのタイトルと説明を表示するコンポーネント。frontmatterの`title`と`description`を自動的に読み取ります。

```markdown
---
title: /setup
description: 新規プレイ用のカテゴリ、チャンネル、ロールを一括作成します。
---
<PageHeader />
```

### CommandList

`/commands/index.md`で使用。サイドバー設定と各コマンドページのfrontmatterからコマンド一覧を自動生成します。

```markdown
<CommandList />
```

## SEO・OGP対応

### 構造化データ（JSON-LD）

`config.mts`で以下の構造化データを自動生成：

- **WebSite**: サイト全体の情報
- **Organization**: 組織情報
- **SoftwareApplication**: Botアプリケーション情報
- **BreadcrumbList**: パンくずリスト（ページごと動的生成）
- **HowTo**: 導入ガイドページ用
- **TechArticle**: コマンド・ガイドページ用

### OGP画像自動生成

ビルド時に`generateOgImages.mts`が各ページのOGP画像（1200x630px）を自動生成します。

- 出力先: `.vitepress/dist/og/[path].png`
- frontmatterの`title`と`description`を使用
- Discord Blurpleカラー (#5865F2) のアクセント

### 動的メタタグ

`transformHead`フックで以下を動的生成：

- canonical URL
- Open Graph (og:title, og:description, og:image)
- Twitter Card

## 自動更新システム

### GitHub Actions統合

#### 1. ドキュメントデプロイ (`.github/workflows/docs.yml`)

- **トリガー**: `main`ブランチへの`docs/**`の変更
- **処理**: VitePressビルド → GitHub Pagesへデプロイ

#### 2. ドキュメント自動更新 (`.github/workflows/update-docs.yml`)

- **トリガー**: `main`ブランチへの`src/**`の変更
- **処理**: Claude Code Actionがソースコードを解析 → ドキュメントを更新 → ドラフトPR作成

### リリースノート自動生成

`scripts/generate-releases.mjs`がGitHub Releasesから情報を取得し、`docs/releases.md`を自動生成します。

- ビルド時に自動実行（`docs:build`スクリプトに含まれる）
- キャッシュ機能で不要なAPI呼び出しを削減
- `.gitignore`で`releases.md`を除外（毎回生成）

## コンテンツ作成のガイドライン

### 文章のトーン

ドキュメント全体で統一的なトーンを保つため、以下のルールに従ってください：

- **淡々とした説明口調**: 感嘆符（！）や過度に親しみやすい表現は避け、事実を客観的に記述する
- **命令形の使用**: 「〜しましょう」「〜してみましょう」ではなく「〜してください」「〜します」を使用
- **具体的な表現**: 「試しに」「実際に」などの曖昧な表現は避け、明確な指示を提供

**良い例**:
- 「適当なテキストチャンネルで `/ping` コマンドを実行して、Botが正しく動作しているか確認してください。」
- 「導入が完了したら、以下のページで各機能の詳細を確認できます。」

**悪い例**:
- 「試しに適当なテキストチャンネルで `/ping` コマンドを実行して、Botが正しく動作しているか確認しましょう！」
- 「準備が完了したら、実際にマダミナリンクの機能を使ってみましょう！」

### Markdown記法

VitePressの拡張Markdown記法を活用してください：

```markdown
::: warning 注意
重要な注意点
:::

::: tip ヒント
便利な使い方
:::

::: danger 危険
取り消しできない操作の警告
:::
```

### コマンドの説明方法

1. **概要**: コマンドの目的を1-2文で簡潔に
2. **使用方法**: コマンドの基本的な構文
3. **オプション**: 表形式で必須/任意を明記
4. **使用例**: 基本例と応用例を複数
5. **ユースケース**: 実際の使用シーンを具体的に

### 例示の重要性

コマンドの説明では、実際の使用例を豊富に含めてください：

- 良い例: 具体的な値を使った実行例
- 悪い例: プレースホルダーのみの抽象的な説明

## 開発フロー

### npm scripts

```bash
bun run docs:dev      # 開発サーバー起動（--host付きで外部アクセス可能）
bun run docs:build    # ビルド（リリースノート生成 + VitePressビルド + OGP画像生成）
bun run docs:preview  # ビルド結果をプレビュー
bun run docs:tunnel   # Cloudflare Quick TunnelでOGPプレビュー
```

### OGPプレビュー

`docs:tunnel`コマンドでCloudflare Quick Tunnelを使用し、DiscordやTwitterでのOGP表示を実機確認できます。

```bash
bun run docs:tunnel
# ランダムなURL（*.trycloudflare.com）が生成される
```

### 本番デプロイ

1. `docs/**` を編集
2. ブランチにコミット・プッシュ
3. PRを作成してレビュー
4. `main`にマージ
5. GitHub Actionsが自動ビルド・デプロイ
6. `https://docs.madaminalink.com` に反映

## 画像ファイルの管理

### 配置場所の使い分け

| 配置場所 | 用途 | 参照方法 | 例 |
|---------|------|---------|-----|
| `docs/images/` | ページ固有の画像（スクリーンショット、説明図） | 相対パス参照 | 操作手順のスクリーンショット |
| `docs/public/images/common/` | 共通素材（ロゴ、アイコン） | 絶対パス参照 | ファビコン、OG画像、ヒーロー画像 |

### 画像の参照方法

#### ページ固有の画像（`docs/images/`）

相対パスで参照：

```markdown
# docs/guide/getting-started.md から画像を参照
![ロール設定画面](../images/guide/getting-started/role-order.png)

# docs/commands/setup.md から画像を参照
![設定完了画面](../images/commands/setup/complete.png)
```

#### 共通素材（`docs/public/images/common/`）

絶対パス（ルートからのパス）で参照：

```markdown
![マダミナリンクのアイコン](/images/common/icon.png)
```

### 画像ファイルの命名規則

- **小文字とハイフンを使用**: `add-app-button.png`（推奨）、`AddAppButton.png`（非推奨）
- **内容が分かりやすい名前**: `screenshot.png`（悪い例）→ `role-order-settings.png`（良い例）
- **連番が必要な場合は末尾に数字**: `setup-step-1.png`, `setup-step-2.png`

### 代替テキストの記述

画像には必ず適切な代替テキスト（alt text）を設定してください：

```markdown
# 悪い例
![alt text](../images/guide/getting-started/image.png)
![](../images/commands/setup/screenshot.png)

# 良い例
![マダミナリンクのプロフィール画面](../images/guide/getting-started/add-app-button.png)
![ロール設定の完了画面](../images/commands/setup/role-creation-complete.png)
```

### 画像記述方法の選択

画像を表示する際は、**Markdown記法を基本**としますが、用途に応じてHTML記法を使い分けます。

#### 選択基準

| ケース | 推奨方法 | 理由 |
|--------|---------|------|
| 単一画像で説明 | Markdown | シンプル、読みやすい、保守性が高い |
| 複数画像を横並び表示 | HTML | ユーザーが同時に比較でき、UI/UX向上 |
| 画像サイズを調整したい | HTML | max-widthで柔軟に制御可能 |

#### HTML記法（横並び表示）

```html
<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-start;">
  <img src="../images/guide/getting-started/add-app-button.png" alt="マダミナリンクのプロフィール画面" style="max-width: 45%; height: auto;">
  <img src="../images/guide/getting-started/bot-invite-permissions.png" alt="Bot招待時の権限選択画面" style="max-width: 45%; height: auto;">
</div>
```

### 画像の最適化

- **ファイルサイズ**: 1枚あたり100KB以下が推奨（スクリーンショットの場合は200KB程度まで許容）
- **フォーマット**: PNG（スクリーンショット）、WebP（写真・イラスト）
- **解像度**: 画面幅1280px程度を基準に、必要以上に高解像度にしない

## 技術仕様

### 依存関係

ドキュメント関連の依存パッケージ（`package.json`より）：

```json
{
  "devDependencies": {
    "@vercel/og": "^0.8.5",      // OGP画像生成
    "glob": "^13.0.0",           // ファイルパターンマッチング
    "gray-matter": "^4.0.3",     // frontmatter解析
    "vitepress": "^1.6.4"        // ドキュメントフレームワーク
  }
}
```

### カスタムドメイン

- ドメイン: `docs.madaminalink.com`
- DNS: Cloudflare管理
- CNAME: `minarin0179.github.io`

### Git管理

`docs/.gitignore` の設定により以下を除外：

- `.vitepress/dist` - ビルド出力
- `.vitepress/cache` - ビルドキャッシュ
- `releases.md` - 自動生成ファイル

## 参考リンク

- [VitePress公式ドキュメント](https://vitepress.dev/)
- [Claude Code GitHub Actions](https://code.claude.com/docs/ja/github-actions)
- [既存ドキュメント (note)](https://note.com/minarin0179/m/me29daedb779d)
- [Botリポジトリ](https://github.com/minarin0179/Madaminalink_v2)
