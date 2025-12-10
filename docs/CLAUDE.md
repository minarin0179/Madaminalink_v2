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
├── images/                 # 画像ファイル管理
│   ├── common/             # ロゴ、アイコンなど共通素材
│   ├── guide/              # ガイドページ用画像
│   │   └── getting-started/
│   └── commands/           # コマンド説明用画像
│       ├── setup/
│       ├── remind/
│       └── ...
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
- スクリーンショットは`docs/images/`配下の適切なディレクトリに配置
- 内部リンクは相対パス（例: `[/setup](/commands/setup)`）を使用

## 画像ファイルの管理

### ディレクトリ構成

画像ファイルは`docs/images/`配下で管理します：

```
docs/images/
├── common/              # ロゴ、アイコン、ヘッダー画像など共通素材
├── guide/               # ガイドページ用の画像
│   ├── getting-started/ # getting-started.md用
│   └── ...              # 他のガイドページ用（今後追加）
└── commands/            # コマンド説明用の画像
    ├── setup/           # /setupコマンド用
    ├── remind/          # /remindコマンド用
    ├── role/            # /roleコマンド用
    └── ...              # 他のコマンド用
```

### 画像の参照方法

マークダウンファイルから相対パスで画像を参照します：

```markdown
# docs/guide/getting-started.md から画像を参照する場合
![説明文](../images/guide/getting-started/ファイル名.png)

# docs/commands/setup.md から画像を参照する場合
![説明文](../images/commands/setup/ファイル名.png)
```

### 画像ファイルの命名規則

- **小文字とハイフンを使用**: `add-app-button.png`（推奨）、`AddAppButton.png`（非推奨）
- **内容が分かりやすい名前**: `screenshot.png`（悪い例）→ `role-order-settings.png`（良い例）
- **連番が必要な場合は末尾に数字**: `setup-step-1.png`, `setup-step-2.png`

### 代替テキストの記述

画像には必ず適切な代替テキスト（alt text）を設定してください：

```markdown
# ❌ 悪い例
![alt text](../images/guide/getting-started/image.png)
![](../images/commands/setup/screenshot.png)

# ✅ 良い例
![マダミナリンクのプロフィール画面](../images/guide/getting-started/add-app-button.png)
![ロール設定の完了画面](../images/commands/setup/role-creation-complete.png)
```

代替テキストは以下の目的で使用されます：
- スクリーンリーダー利用者への情報提供
- 画像が読み込めない場合の代替表示
- SEO対策

### 画像記述方法の選択

画像を表示する際は、**Markdown記法を基本**としますが、用途に応じてHTML記法を使い分けます。

#### 選択基準

| ケース | 推奨方法 | 理由 |
|--------|---------|------|
| 単一画像で説明 | Markdown | シンプル、読みやすい、保守性が高い |
| 複数画像を横並び表示 | HTML | ユーザーが同時に比較でき、UI/UX向上 |
| 画像サイズを調整したい | HTML | max-widthで柔軟に制御可能 |

#### Markdown記法（基本）

通常の画像表示にはMarkdown記法を使用します：

```markdown
![ロール設定画面](../images/guide/getting-started/role-order.png)
![pingコマンドの実行結果](../images/guide/getting-started/ping-result.png)
```

**利点**：
- シンプルで読みやすい
- 保守性が高い
- VitePressのデフォルトレスポンシブ対応が効く

#### HTML記法（横並び表示）

複数の画像を横に並べて表示する場合はHTML記法を使用します：

```html
<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-start;">
  <img src="../images/guide/getting-started/add-app-button.png" alt="マダミナリンクのプロフィール画面" style="max-width: 45%; height: auto;">
  <img src="../images/guide/getting-started/bot-invite-permissions.png" alt="Bot招待時の権限選択画面" style="max-width: 45%; height: auto;">
</div>
```

**スタイル属性の説明**：
- `display: flex`：横並びレイアウト
- `gap: 1rem`：画像間の余白（16px相当）
- `flex-wrap: wrap`：小画面では自動的に縦並びに（レスポンシブ対応）
- `align-items: flex-start`：画像の高さが異なる場合に上揃え
- `max-width: 45%`：画像を画面幅の45%に制限（2枚並べる場合）
- `height: auto`：アスペクト比を維持

**ユースケース**：
- 操作の前後を比較する（例：設定前・設定後）
- 連続した操作手順を見せる（例：プロフィール画面 → 招待画面）
- 似た画面の違いを強調する

#### 実装例の参照

[getting-started.md](guide/getting-started.md) の15-18行目で、2枚の画像を横並び表示する実装例を確認できます。

### 画像の最適化

- **ファイルサイズ**: 1枚あたり100KB以下が推奨（スクリーンショットの場合は200KB程度まで許容）
- **フォーマット**: PNG（スクリーンショット）、WebP（写真・イラスト）
- **解像度**: 画面幅1280px程度を基準に、必要以上に高解像度にしない

### 共通素材の管理

ロゴやアイコンなど、複数ページで使用する画像は`docs/images/common/`に配置します：

```markdown
# ロゴの参照例
![マダミナリンクロゴ](../images/common/logo.png)

# アイコンの参照例
![警告アイコン](../images/common/icon-warning.png)
```

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

## 参考リンク

- [VitePress公式ドキュメント](https://vitepress.dev/)
- [Claude Code GitHub Actions](https://code.claude.com/docs/ja/github-actions)
- [既存ドキュメント (note)](https://note.com/minarin0179/m/me29daedb779d)
- [Botリポジトリ](https://github.com/minarin0179/Madaminalink_v2)
