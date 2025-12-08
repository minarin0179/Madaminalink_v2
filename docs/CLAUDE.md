# ドキュメント作成ガイド

このドキュメントは、マダミナリンクのユーザーガイドをVitePressで構築する際の設計思想と構成についてまとめたものです。

## プロジェクト概要

- **プロジェクト名**: マダミナリンク (Madaminalink)
- **種類**: マーダーミステリー向けDiscord Bot
- **ドキュメントサイト**: `https://docs.madaminalink.com`
- **フレームワーク**: VitePress
- **言語**: 日本語

## ディレクトリ構成

```
docs/
├── .vitepress/
│   └── config.mts          # VitePress設定ファイル
├── public/
│   └── CNAME               # カスタムドメイン設定
├── guide/
│   └── getting-started.md  # 導入ガイド
├── commands/
│   ├── index.md            # コマンド一覧
│   ├── _template.md        # コマンドページのテンプレート
│   └── [コマンド名].md     # 各コマンドの詳細ページ（今後追加）
├── index.md                # トップページ
└── CLAUDE.md               # このファイル（ドキュメント作成ガイド）
```

## 設計思想

### 1. ユーザー中心の構成

ドキュメントは以下の3つのセクションに分かれています：

| セクション | 目的 | 対象ユーザー |
|-----------|------|--------------|
| **はじめに** (`/guide/`) | Botの導入方法、基本的な使い方 | 初めて使うユーザー |
| **コマンド一覧** (`/commands/`) | 各コマンドの詳細な使い方 | 実際に使っているユーザー |
| **トップページ** (`/`) | 全体像の把握、主要機能の紹介 | すべてのユーザー |

### 2. コマンドのカテゴリ分け

コマンドは用途別に以下のカテゴリに分類されています：

- **セットアップ系**: `/setup`, `/role`
- **進行管理**: `/open`, `/gather`, `/dice`, `/poll`, `/remind`, `/order`
- **ログ・アーカイブ**: `/archive`, `/transfer`, `/log`
- **クリーンアップ**: `/cleanup`, `/delete`, `/rename`
- **その他**: `/copy`, `/sync`, `/server`, `/profile`, `/ping`

この分類は、マーダーミステリーのゲーム進行フローに沿った順序になっています。

### 3. テンプレートベースのコンテンツ作成

新しいコマンドページを作成する際は、`docs/commands/_template.md` を参考にしてください。

テンプレートには以下のセクションが含まれています：

```markdown
# /コマンド名

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

### デッドリンク許可

```typescript
ignoreDeadLinks: true
```

未作成のコマンドページへのリンクがあってもビルドエラーにならないよう設定しています。コンテンツを段階的に追加できます。

### サイドバー構成

サイドバーはカテゴリごとに折りたたみ可能なグループとして構成されています。新しいページを追加する際は、適切なカテゴリの `items` 配列に追加してください。

## 自動更新システム

### GitHub Actions統合

2つのワークフローが自動化されています：

#### 1. ドキュメントデプロイ (`.github/workflows/docs.yml`)

- **トリガー**: `main`ブランチへの`docs/**`の変更
- **処理**: VitePressビルド → GitHub Pagesへデプロイ

#### 2. ドキュメント自動更新 (`.github/workflows/update-docs.yml`)

- **トリガー**: `main`ブランチへの`src/**`の変更
- **処理**: Claude Code Actionがソースコードを解析 → ドキュメントを更新 → ドラフトPR作成

### Claude Code Actionの動作

ソースコードが変更されると、Claudeが以下を実行します：

1. 変更されたファイルを読んで機能変更を理解
2. 対応するドキュメントファイルを確認
3. 存在しない場合は新規作成、存在する場合は更新
4. 新規ページ作成時はサイドバー設定も更新
5. ドラフトPRを作成

## コンテンツ作成のガイドライン

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

- ✅ 良い例: 具体的な値を使った実行例
- ❌ 悪い例: プレースホルダーのみの抽象的な説明

## デプロイフロー

### 開発時

```bash
bun run docs:dev  # ローカルサーバー起動 (http://localhost:5173)
```

### ビルド確認

```bash
bun run docs:build   # ビルド実行
bun run docs:preview # ビルド結果をプレビュー
```

### 本番デプロイ

1. `docs/**` を編集
2. `docs/add-content` ブランチにコミット・プッシュ
3. PRを作成してレビュー
4. `main`にマージ
5. GitHub Actionsが自動ビルド・デプロイ
6. `https://docs.madaminalink.com` に反映

## コンテンツ移植作業

### noteからの移植手順

1. noteの既存記事を確認: https://note.com/minarin0179/m/me29daedb779d
2. `docs/commands/_template.md` をコピーして新規ページ作成
3. noteの内容をMarkdown形式に変換
4. VitePressの拡張記法を活用して見やすく整形
5. `docs/.vitepress/config.mts` のサイドバーに追加
6. ローカルで確認（`bun run docs:dev`）
7. コミット・プッシュ

### 移植時の注意点

- コマンドの動作が変更されている場合は最新の動作を反映
- スクリーンショットは`docs/public/images/`に配置
- 内部リンクは相対パス（例: `[/setup](/commands/setup)`）を使用

## 技術仕様

### カスタムドメイン

- ドメイン: `docs.madaminalink.com`
- DNS: Cloudflare管理
- CNAME: `minarin0179.github.io`

### VitePress バージョン

- VitePress: `^1.6.4`
- 設定ファイル: ESM形式 (`.mts`)

### Git管理

`.gitignore` の設定により以下を除外：

- `docs/.vitepress/dist` - ビルド出力
- `docs/.vitepress/cache` - ビルドキャッシュ

## 今後の展開

### フェーズ1: 基盤構築 ✅

- [x] VitePressセットアップ
- [x] GitHub Pages デプロイ設定
- [x] カスタムドメイン設定
- [x] Claude Code Action 統合
- [x] テンプレート作成

### フェーズ2: コンテンツ作成（進行中）

- [ ] 全コマンドのドキュメント作成
- [ ] 導入ガイドの充実
- [ ] ユースケース集の追加
- [ ] FAQ作成

### フェーズ3: 拡張機能（将来）

- [ ] 検索機能の最適化
- [ ] ダークモードのカスタマイズ
- [ ] 動画チュートリアルの埋め込み
- [ ] 多言語対応（英語版）

## 参考リンク

- [VitePress公式ドキュメント](https://vitepress.dev/)
- [Claude Code GitHub Actions](https://code.claude.com/docs/ja/github-actions)
- [既存ドキュメント (note)](https://note.com/minarin0179/m/me29daedb779d)
- [Botリポジトリ](https://github.com/minarin0179/Madaminalink_v2)
