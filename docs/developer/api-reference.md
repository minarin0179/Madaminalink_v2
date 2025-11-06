# APIリファレンス

Madaminalinkの主要クラス、インターフェース、ユーティリティ関数の詳細なリファレンスです。

## 📋 目次

- [コアクラス](#コアクラス)
- [コマンドクラス](#コマンドクラス)
- [コンポーネントクラス](#コンポーネントクラス)
- [ユーティリティ関数](#ユーティリティ関数)
- [型定義](#型定義)
- [定数](#定数)

---

## コアクラス

### ExtendedClient

**場所:** `src/structures/Client.ts`

Discord.jsの`Client`を拡張したメインクライアントクラス。

#### プロパティ

```typescript
class ExtendedClient extends Client {
    commands: Collection<string, Command>
    components: Collection<string, Component>
}
```

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `commands` | `Collection<string, Command>` | コマンド名をキーとしたコマンドのコレクション |
| `components` | `Collection<string, Component>` | customIdをキーとしたコンポーネントのコレクション |

#### メソッド

##### `start(): void`

Bot を起動します。モジュールの登録とDiscordへのログインを実行。

```typescript
const client = new ExtendedClient({ intents: [...] })
client.start()
```

---

##### `registerModules(): Promise<void>`

コマンド、イベント、コンポーネントを動的にロードします。

**処理内容:**
1. `src/commands/` 配下の全コマンドをスキャン
2. `src/events/` 配下の全イベントハンドラを登録
3. `src/components/` 配下の全コンポーネントを登録

**自動実行:** `start()` 内で呼び出されます。

---

##### `importfile(filePath: string): Promise<any>`

指定されたファイルを動的にインポートします。

**引数:**
- `filePath` - インポートするファイルのパス

**戻り値:** インポートしたモジュールのデフォルトエクスポート

```typescript
const command = await client.importfile('./commands/slashcommands/ping.ts')
```

---

## コマンドクラス

### SlashCommand

**場所:** `src/structures/SlashCommand.ts`

スラッシュコマンドの基底クラス。

#### 型定義

```typescript
interface SlashCommandType {
    data: SlashCommandBuilder
    execute: RunFunction
    dev?: boolean
    danger?: boolean
}

interface SlashCommandRunOptions {
    client: ExtendedClient
    interaction: ChatInputCommandInteraction
    args: CommandInteractionOptionResolver
}

type RunFunction = (options: SlashCommandRunOptions) => Promise<any>
```

#### プロパティ

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `data` | `SlashCommandBuilder` | コマンドの定義（名前、説明、オプション） |
| `execute` | `RunFunction` | コマンド実行時の処理 |
| `dev` | `boolean?` | 開発サーバー専用コマンドか |
| `danger` | `boolean?` | 破壊的コマンドか（24時間制限対象） |

#### 使用例

```typescript
import { SlashCommand } from '../../structures/SlashCommand'
import { SlashCommandBuilder } from 'discord.js'

export default class PingCommand extends SlashCommand {
    constructor() {
        super({
            data: new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Pong!'),
            execute: async ({ interaction }) => {
                await interaction.reply('Pong!')
            }
        })
    }
}
```

---

### ContextMenu

**場所:** `src/structures/ContextMenu.ts`

コンテキストメニューコマンドの基底クラス。

#### 型定義

```typescript
interface ContextMenuType {
    data: ContextMenuCommandBuilder
    execute: RunFunction
}
```

右クリックメニューから実行されるコマンドを定義します。

---

## コンポーネントクラス

### Button

**場所:** `src/structures/Button.ts`

ボタンコンポーネントの基底クラス。

#### プロパティ

```typescript
class Button extends Component {
    customId: string
    execute: RunFunction
}
```

| プロパティ | 型 | 説明 |
|-----------|------|------|
| `customId` | `string` | ボタンの識別子（`;` 区切りで引数を含む） |
| `execute` | `RunFunction` | ボタンクリック時の処理 |

#### customId の規約

`customId` は以下の形式で引数を含めることができます：

```
componentName;arg1;arg2;arg3
```

例:
```typescript
customId: "poll;vote;characterA;pollId123"
// → componentName = "poll"
// → args = ["vote", "characterA", "pollId123"]
```

#### 使用例

```typescript
import { Button } from '../../structures/Button'

export default class MyButton extends Button {
    constructor() {
        super({
            customId: 'mybutton',
            execute: async ({ interaction, args }) => {
                const [action, value] = args
                await interaction.reply(`Action: ${action}, Value: ${value}`)
            }
        })
    }
}
```

ボタン作成時：

```typescript
import { ButtonBuilder, ButtonStyle } from 'discord.js'

const button = new ButtonBuilder()
    .setCustomId('mybutton;click;123')  // customId;arg1;arg2
    .setLabel('Click Me')
    .setStyle(ButtonStyle.Primary)
```

---

### SelectMenu

**場所:** `src/structures/SelectMenu.ts`

セレクトメニューコンポーネントの基底クラス。

#### プロパティ

```typescript
class SelectMenu extends Component {
    customId: string
    execute: RunFunction
}
```

ドロップダウンメニューの選択イベントを処理します。

---

### Modal

**場所:** `src/structures/Modal.ts`

モーダルフォームの基底クラス。

#### プロパティ

```typescript
class Modal extends Component {
    customId: string
    execute: RunFunction
}
```

モーダルフォームの送信イベントを処理します。

---

## ユーティリティ関数

### Reply

**場所:** `src/utils/Reply.ts`

インタラクションへのレスポンスを統一的に処理するヘルパー関数。

#### `reply()`

```typescript
async function reply(
    interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
    options: InteractionReplyOptions | string
): Promise<Message | InteractionResponse | undefined>
```

**引数:**
- `interaction` - 対象のインタラクション
- `options` - レスポンスの内容（文字列またはオプションオブジェクト）

**動作:**
- `interaction.replied` または `interaction.deferred` の場合は `followUp()` を使用
- そうでない場合は `reply()` を使用
- デフォルトで `ephemeral: true`（一時的なメッセージ）

**使用例:**

```typescript
import { reply } from '../utils/Reply'

// 文字列を送信
await reply(interaction, 'Hello!')

// オプション指定
await reply(interaction, {
    content: 'Hello!',
    ephemeral: false,  // 全員に表示
    embeds: [embed]
})
```

---

### FetchAllMessages

**場所:** `src/utils/FetchAllMessages.ts`

チャンネルの全メッセージを取得します（ページネーション処理込み）。

```typescript
async function fetchAllMessages(
    channel: TextChannel | ThreadChannel
): Promise<Message[]>
```

**引数:**
- `channel` - 対象チャンネル

**戻り値:** 全メッセージの配列（古い順）

**特徴:**
- Discord APIの100件制限を自動処理
- レート制限を考慮
- アーカイブ済み・プライベートスレッドにも対応

**使用例:**

```typescript
import { fetchAllMessages } from '../utils/FetchAllMessages'

const messages = await fetchAllMessages(channel)
console.log(`Total: ${messages.length} messages`)
```

---

### transferMessage

**場所:** `src/utils/transferMessage.ts`

メッセージを別のチャンネルにコピーします（添付ファイル含む）。

```typescript
async function transferMessage(
    message: Message,
    destination: TextChannel,
    options?: TransferOptions
): Promise<Message>
```

**引数:**
- `message` - コピー元メッセージ
- `destination` - コピー先チャンネル
- `options` - オプション設定
  - `includeAttachments?: boolean` - 添付ファイルをコピー（デフォルト: true）
  - `maxFileSize?: number` - 最大ファイルサイズ（デフォルト: 10MB）

**使用例:**

```typescript
import { transferMessage } from '../utils/transferMessage'

await transferMessage(message, targetChannel, {
    includeAttachments: true,
    maxFileSize: 10 * 1024 * 1024  // 10MB
})
```

---

### ButtonToRow

**場所:** `src/utils/ButtonToRow.ts`

ボタンの配列を `ActionRowBuilder` の配列に変換します。

```typescript
function ButtonToRow(
    buttons: ButtonBuilder[]
): ActionRowBuilder<ButtonBuilder>[]
```

**制約:**
- 1行に最大5個のボタン
- 自動的に複数行に分割

**使用例:**

```typescript
import { ButtonToRow } from '../utils/ButtonToRow'
import { ButtonBuilder, ButtonStyle } from 'discord.js'

const buttons = [
    new ButtonBuilder().setCustomId('btn1').setLabel('Button 1').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('btn2').setLabel('Button 2').setStyle(ButtonStyle.Primary),
    // ... 最大25個
]

const rows = ButtonToRow(buttons)

await interaction.reply({
    content: 'Select an option:',
    components: rows
})
```

---

### DeleteMultiMessages

**場所:** `src/utils/DeleteMultiMessages.ts`

複数のメッセージを効率的に削除します。

```typescript
async function deleteMultiMessages(
    channel: TextChannel,
    messages: Message[]
): Promise<void>
```

**特徴:**
- 14日以内のメッセージは `bulkDelete()` で一括削除
- 14日以上前のメッセージは個別に削除
- レート制限を考慮

---

### SplitMessage

**場所:** `src/utils/SplitMessage.ts`

長いメッセージを2000文字以下に分割します。

```typescript
function splitMessage(
    text: string,
    maxLength?: number
): string[]
```

**引数:**
- `text` - 分割対象のテキスト
- `maxLength` - 最大文字数（デフォルト: 2000）

**戻り値:** 分割された文字列の配列

**使用例:**

```typescript
import { splitMessage } from '../utils/SplitMessage'

const longText = '...'  // 5000文字のテキスト
const chunks = splitMessage(longText)

for (const chunk of chunks) {
    await channel.send(chunk)
}
```

---

### ArraySplit

**場所:** `src/utils/ArraySplit.ts`

配列を指定サイズのチャンクに分割します。

```typescript
function arraySplit<T>(
    array: T[],
    size: number
): T[][]
```

**使用例:**

```typescript
import { arraySplit } from '../utils/ArraySplit'

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const chunks = arraySplit(items, 3)
// => [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
```

---

### isCategory / isEditable / isEmptyMessage

**場所:** `src/utils/`

チャンネルやメッセージの状態を判定するヘルパー関数。

```typescript
function isCategory(channel: Channel): boolean
function isEditable(message: Message): boolean
function isEmptyMessage(message: Message): boolean
```

---

## 型定義

### Poll（Mongoose モデル）

**場所:** `src/structures/Poll.ts`

投票データのMongooseスキーマ。

```typescript
interface IPoll {
    messageId: string        // 投票メッセージのID
    channelId: string        // チャンネルID
    title: string            // 投票タイトル
    choices: string[]        // 選択肢
    votes: Map<string, string>  // userId -> choice
    allowChange: boolean     // 投票変更許可
    showVoters: boolean      // 投票者表示
    createdAt: Date
}
```

**使用例:**

```typescript
import Poll from '../structures/Poll'

// 新規作成
const poll = new Poll({
    messageId: '123456789',
    channelId: '987654321',
    title: 'キャラクター選択',
    choices: ['キャラA', 'キャラB', 'キャラC'],
    allowChange: true,
    showVoters: false
})
await poll.save()

// 検索
const existingPoll = await Poll.findOne({ messageId: '123456789' })

// 投票を追加
existingPoll.votes.set('userId123', 'キャラA')
await existingPoll.save()
```

---

### ChannelLink

**場所:** `src/structures/ChannelLink.ts`

チャンネル間の参照を表す型定義。

```typescript
interface ChannelLink {
    sourceId: string
    targetId: string
    type: 'copy' | 'archive' | 'transfer'
}
```

---

## 定数

### MyConstants

**場所:** `src/constants/MyConstants.ts`

システム全体で使用する定数。

```typescript
export namespace MyConstants {
    // ファイルサイズ制限
    export const maxFileSize = 10 * 1024 * 1024  // 10MB

    // テキスト長制限
    export const maxChannelNameLength = 100
    export const maxNicknameLength = 32
    export const maxMessageLength = 2000

    // 投票制限
    export const maxPollChoices = 23           // Discordボタン制限
    export const maxPollChoiceLength = 50
    export const maxCharVoters = 50           // キャラクター投票の最大人数
    export const maxVoteVoters = 25           // 一般投票の最大人数

    // 色
    export namespace color {
        export const embed_background = 0x2c2d31  // Discord ダークテーマ背景色
        export const success = 0x00ff00
        export const error = 0xff0000
        export const warning = 0xffaa00
    }
}
```

**使用例:**

```typescript
import { MyConstants } from '../constants/MyConstants'

if (file.size > MyConstants.maxFileSize) {
    return reply(interaction, 'ファイルサイズが大きすぎます')
}

const embed = new EmbedBuilder()
    .setColor(MyConstants.color.embed_background)
    .setTitle('投票結果')
```

---

## イベントハンドラ

### interactionCreate

**場所:** `src/events/interactionCreate.ts`

全インタラクションのメインディスパッチャー。

**処理フロー:**

1. インタラクションの種類を判定
2. 対応するハンドラを呼び出し
3. エラーハンドリング
4. 安全機能（24時間制限など）を適用

**カスタマイズポイント:**

```typescript
// 特定コマンドの実行前に処理を追加
if (interaction.commandName === 'setup') {
    // 権限チェックなど
}

// グローバルエラーハンドリング
catch (error) {
    if (error.code === 50013) {
        return reply(interaction, '権限が不足しています')
    }
}
```

---

### ready

**場所:** `src/events/ready.ts`

Bot起動完了時のイベント。

**処理内容:**
- ログ出力
- Bot のステータス設定
- 定期実行タスクの開始

---

### guildCreate

**場所:** `src/events/guildCreate.ts`

Botが新しいサーバーに参加した時のイベント。

**処理内容:**
- ウェルカムメッセージの送信
- 参加ログの記録

---

## Agendaジョブ

**場所:** `src/agenda.ts`

リマインダーのスケジューリングシステム。

### 使用例

```typescript
import { agenda } from './agenda'

// ジョブの定義
agenda.define('send-reminder', async (job) => {
    const { channelId, message, roleId } = job.attrs.data
    const channel = await client.channels.fetch(channelId)
    await channel.send({
        content: roleId ? `<@&${roleId}> ${message}` : message
    })
})

// ジョブのスケジュール
await agenda.schedule('2024-12-25 20:00', 'send-reminder', {
    channelId: '123456789',
    message: 'ゲーム開始です！',
    roleId: '987654321'
})
```

---

## 開発のベストプラクティス

### 1. エラーハンドリング

```typescript
try {
    await someAsyncOperation()
} catch (error) {
    console.error('Error:', error)
    await reply(interaction, 'エラーが発生しました')
}
```

### 2. 権限チェック

```typescript
if (!interaction.memberPermissions?.has('ManageChannels')) {
    return reply(interaction, '権限が不足しています')
}
```

### 3. 型安全性の確保

```typescript
// 型ガードの使用
if (interaction.channel?.isTextBased()) {
    // TextChannel として扱える
}
```

---

## 📖 関連ドキュメント

- [アーキテクチャ](./architecture.md) - システム設計
- [開発環境構築](./setup.md) - ローカル開発のセットアップ
- [コントリビューション](./contributing.md) - プロジェクトへの貢献
