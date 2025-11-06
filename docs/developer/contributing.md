# コントリビューションガイド

Madaminalinkプロジェクトへの貢献方法を説明します。バグ報告、機能提案、コード貢献など、あらゆる形での貢献を歓迎します！

## 📋 目次

- [貢献の方法](#貢献の方法)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [コーディング規約](#コーディング規約)
- [プルリクエストの作成](#プルリクエストの作成)
- [イシューの報告](#イシューの報告)
- [コミュニティガイドライン](#コミュニティガイドライン)

---

## 貢献の方法

### 🐛 バグ報告

バグを発見した場合は、[GitHub Issues](https://github.com/minarin0179/Madaminalink_v2/issues) で報告してください。

**良いバグ報告に含めるべき情報:**
- 明確なタイトル
- 再現手順
- 期待される動作
- 実際の動作
- エラーメッセージ（あれば）
- 環境情報（OS、Node.js/Bunバージョンなど）

**テンプレート:**

```markdown
## 概要
[バグの簡潔な説明]

## 再現手順
1. `/command` を実行
2. ...
3. エラーが発生

## 期待される動作
[期待される動作の説明]

## 実際の動作
[実際に起こった動作の説明]

## エラーメッセージ
```
[エラーメッセージをここに貼り付け]
```

## 環境
- OS: Ubuntu 22.04
- Bun: 1.0.0
- Discord.js: 14.14.1
```

---

### 💡 機能提案

新機能のアイデアがある場合も、GitHub Issuesで提案してください。

**良い機能提案に含めるべき情報:**
- 機能の概要
- ユースケース（どのような場面で役立つか）
- 実装案（任意）
- 代替案（あれば）

**テンプレート:**

```markdown
## 機能の概要
[提案する機能の簡潔な説明]

## 動機・ユースケース
[なぜこの機能が必要か、どのような場面で役立つか]

## 提案する実装方法
[どのように実装するか（技術的な詳細）]

## 代替案
[他に考えられる実装方法]

## その他
[追加の情報]
```

---

### 📝 ドキュメント改善

ドキュメントの誤字脱字、説明の改善、新しいガイドの追加なども大歓迎です。

---

### 💻 コード貢献

新機能の実装、バグ修正、リファクタリングなど、コードによる貢献も歓迎します。

---

## 開発環境のセットアップ

### ステップ1: リポジトリをフォーク

1. [GitHub リポジトリ](https://github.com/minarin0179/Madaminalink_v2) にアクセス
2. 右上の「Fork」ボタンをクリック
3. 自分のアカウントにフォークを作成

---

### ステップ2: ローカルにクローン

```bash
# 自分のフォークをクローン
git clone https://github.com/YOUR_USERNAME/Madaminalink_v2.git
cd Madaminalink_v2

# 元のリポジトリをupstreamとして追加
git remote add upstream https://github.com/minarin0179/Madaminalink_v2.git
```

---

### ステップ3: 開発環境の構築

[開発環境構築ガイド](./setup.md)を参照してセットアップしてください。

---

### ステップ4: ブランチの作成

```bash
# 最新のmainブランチを取得
git checkout main
git pull upstream main

# 新しいブランチを作成
git checkout -b feature/my-awesome-feature
```

**ブランチ命名規則:**
- `feature/機能名` - 新機能
- `fix/バグ名` - バグ修正
- `docs/ドキュメント名` - ドキュメント改善
- `refactor/対象` - リファクタリング
- `test/テスト名` - テスト追加

---

## コーディング規約

### TypeScript スタイルガイド

プロジェクトは ESLint + Prettier を使用しています。

#### 基本ルール

```typescript
// ✅ Good
async function fetchMessages(channel: TextChannel): Promise<Message[]> {
    const messages = await channel.messages.fetch({ limit: 100 })
    return Array.from(messages.values())
}

// ❌ Bad
async function fetchMessages(channel) {  // 型指定なし
    let messages = await channel.messages.fetch({ limit: 100 });  // セミコロン不要
    return messages;
}
```

#### インデント

- **4スペース** を使用（タブではない）
- ESLint が自動的にチェック

```typescript
// ✅ Good
if (condition) {
    doSomething()
}

// ❌ Bad
if (condition) {
  doSomething()  // 2スペース
}
```

#### 行の長さ

- 最大120文字

```typescript
// ✅ Good
const message = 'This is a long message that needs to be split'
    + ' into multiple lines to maintain readability'

// ❌ Bad
const message = 'This is a very long message that exceeds 120 characters and makes the code hard to read on most screens'
```

#### 命名規則

| 種類 | 規則 | 例 |
|------|------|-----|
| クラス | PascalCase | `SlashCommand`, `ExtendedClient` |
| 関数・メソッド | camelCase | `fetchAllMessages`, `deleteChannel` |
| 変数 | camelCase | `messageCount`, `channelId` |
| 定数 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_COLOR` |
| インターフェース | PascalCase | `IPoll`, `ChannelLink` |

#### コメント

```typescript
// ✅ Good - 複雑なロジックにコメント
// Discord APIの100件制限を回避するため、ページネーションで全メッセージを取得
async function fetchAllMessages(channel: TextChannel): Promise<Message[]> {
    // ...
}

// ❌ Bad - 自明なコメント
// メッセージを取得
const messages = await channel.messages.fetch()
```

---

### ファイル構成

#### 新しいスラッシュコマンドの追加

```typescript
// src/commands/slashcommands/mycommand.ts
import { SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../../structures/SlashCommand'
import { reply } from '../../utils/Reply'

export default class MyCommand extends SlashCommand {
    constructor() {
        super({
            data: new SlashCommandBuilder()
                .setName('mycommand')
                .setDescription('My awesome command')
                .addStringOption(option =>
                    option
                        .setName('text')
                        .setDescription('Some text')
                        .setRequired(true)
                ),
            execute: async ({ interaction, args }) => {
                const text = args.getString('text', true)
                await reply(interaction, `You said: ${text}`)
            }
        })
    }
}
```

#### 新しいボタンコンポーネントの追加

```typescript
// src/components/buttons/mybutton.ts
import { Button } from '../../structures/Button'
import { reply } from '../../utils/Reply'

export default class MyButton extends Button {
    constructor() {
        super({
            customId: 'mybutton',
            execute: async ({ interaction, args }) => {
                const [action, value] = args
                await reply(interaction, `Action: ${action}`)
            }
        })
    }
}
```

---

### テストの作成（推奨）

現在、テストフレームワークは導入されていませんが、追加を検討しています。

テストを追加する場合は、以下のような構成を推奨：

```typescript
// tests/utils/Reply.test.ts
import { describe, it, expect } from 'bun:test'
import { reply } from '../../src/utils/Reply'

describe('Reply utility', () => {
    it('should reply with string content', async () => {
        // テストコード
    })
})
```

---

### コードフォーマット

コミット前に必ずフォーマットを実行：

```bash
# Prettierでフォーマット
npx prettier --write src/

# ESLintで検証
npx eslint src/

# 自動修正
npx eslint src/ --fix
```

---

## プルリクエストの作成

### ステップ1: コミット

```bash
# 変更をステージング
git add .

# コミット（わかりやすいメッセージで）
git commit -m "feat: Add awesome new feature"
```

**コミットメッセージの規約:**

```
<type>: <subject>

<body>

<footer>
```

**Type の種類:**
- `feat` - 新機能
- `fix` - バグ修正
- `docs` - ドキュメント変更
- `style` - コードフォーマット（機能変更なし）
- `refactor` - リファクタリング
- `test` - テスト追加
- `chore` - ビルド設定など

**例:**

```
feat: Add /remind command with Agenda scheduling

- Implemented reminder creation with time parsing
- Added Agenda job scheduling
- Created delete button for reminders

Closes #42
```

---

### ステップ2: プッシュ

```bash
git push origin feature/my-awesome-feature
```

---

### ステップ3: プルリクエストの作成

1. GitHubで自分のフォークにアクセス
2. 「Compare & pull request」ボタンをクリック
3. 以下の情報を記載：

**プルリクエストテンプレート:**

```markdown
## 概要
[変更内容の簡潔な説明]

## 変更の種類
- [ ] バグ修正
- [ ] 新機能
- [ ] ドキュメント改善
- [ ] リファクタリング
- [ ] その他 (詳細: )

## 変更内容
- [変更点1]
- [変更点2]
- [変更点3]

## テスト方法
1. `/mycommand` を実行
2. 期待される結果を確認

## 関連するIssue
Closes #123

## チェックリスト
- [ ] コードがESLintルールに準拠している
- [ ] 既存のテストが通る
- [ ] 必要に応じてドキュメントを更新した
- [ ] コミットメッセージが規約に従っている
```

---

### ステップ4: レビューへの対応

メンテナーがコードレビューを行い、フィードバックを提供します。

**レビューコメントへの対応:**

```bash
# フィードバックを反映
git add .
git commit -m "fix: Address review comments"
git push origin feature/my-awesome-feature
```

自動的にプルリクエストに反映されます。

---

### ステップ5: マージ

レビューが承認されたら、メンテナーがマージします。

---

## イシューの報告

### バグ報告の手順

1. [GitHub Issues](https://github.com/minarin0179/Madaminalink_v2/issues) にアクセス
2. 「New Issue」をクリック
3. 「Bug Report」テンプレートを選択
4. 必要な情報を記入
5. 「Submit new issue」をクリック

---

### 機能提案の手順

1. GitHub Issues にアクセス
2. 「New Issue」をクリック
3. 「Feature Request」テンプレートを選択
4. 必要な情報を記入
5. Submit

---

## コミュニティガイドライン

### 行動規範

- **尊重** - すべての貢献者を尊重してください
- **協力** - 建設的なフィードバックを提供してください
- **包括性** - あらゆるバックグラウンドの人を歓迎します
- **プロフェッショナリズム** - 技術的な議論に集中してください

---

### コミュニケーション

#### GitHub Issues

- バグ報告
- 機能提案
- 技術的な質問

#### Discord サポートサーバー

[公式サポートサーバー](https://discord.gg/JMqcQstFSK)

- 一般的な質問
- 使い方のサポート
- コミュニティとの交流

---

## 貢献者の認識

すべての貢献者は、プロジェクトのREADMEや貢献者リストに記載されます。

---

## よくある質問

### Q1. 初めての貢献です。どこから始めれば良いですか？

**A:** 「good first issue」ラベルが付いたイシューから始めることをおすすめします。

[Good First Issues を見る](https://github.com/minarin0179/Madaminalink_v2/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

---

### Q2. TypeScript が初めてです。貢献できますか？

**A:** はい！ドキュメントの改善、バグ報告、テストケースの追加など、コード以外の貢献も大歓迎です。

---

### Q3. プルリクエストがマージされるまでどれくらいかかりますか？

**A:** 通常、数日～1週間程度です。複雑な変更の場合はもう少し時間がかかる場合があります。

---

### Q4. 大きな機能を追加したいのですが、どうすれば良いですか？

**A:** まず、GitHub Issueで提案してください。実装前にメンテナーと議論することで、無駄な作業を避けられます。

---

### Q5. レビューで変更を求められました。どうすれば良いですか？

**A:** フィードバックを反映して、同じブランチにコミット＆プッシュしてください。自動的にプルリクエストに反映されます。

---

## 開発のヒント

### デバッグ

```bash
# 詳細なログを出力
DEBUG=* bun run dev

# 特定のモジュールのみ
DEBUG=discord.js:* bun run dev
```

---

### ホットリロード

ファイル変更時に自動再起動：

```bash
bun --watch src/bot.ts
```

---

### MongoDB のデバッグ

```bash
# MongoDBシェルに接続
docker-compose exec mongo mongosh

# データベース一覧
show dbs

# コレクション一覧
use madaminalink
show collections

# ドキュメント確認
db.polls.find().pretty()
```

---

## 参考リソース

- [Discord.js ガイド](https://discordjs.guide/)
- [Discord.js ドキュメント](https://discord.js.org/)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [Bun ドキュメント](https://bun.sh/docs)

---

## 謝辞

Madaminalinkプロジェクトへの貢献を検討していただき、ありがとうございます！

あらゆる形での貢献が、このプロジェクトをより良いものにします。質問や不明点があれば、遠慮なくIssueやDiscordで聞いてください。

Happy Coding! 🎉

---

## 📖 関連ドキュメント

- [開発環境構築](./setup.md) - ローカル開発のセットアップ
- [アーキテクチャ](./architecture.md) - システム設計
- [APIリファレンス](./api-reference.md) - 詳細な仕様
