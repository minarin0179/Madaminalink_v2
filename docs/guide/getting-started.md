# 導入方法

<!--
このファイルはテンプレートです。
noteからコンテンツを移植する際に内容を更新してください。
-->

## Botの招待

以下のいずれかの方法でマダミナリンクをサーバーに招待できます：

- [Botを招待する](https://discord.com/api/oauth2/authorize?client_id=926051893728403486&permissions=8&scope=bot%20applications.commands)
- マダミナリンクのプロフィールから「アプリを追加」ボタンをクリック

<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-start;">
  <img src="../images/guide/getting-started/add-app-button.png" alt="マダミナリンクのプロフィール画面" style="max-width: 45%; height: auto;">
  <img src="../images/guide/getting-started/bot-invite-permissions.png" alt="Bot招待時の権限選択画面" style="max-width: 45%; height: auto;">
</div>

::: warning 必要な権限
マダミナリンクは管理者権限を必要とします。これは以下の機能を実行するためです：
- チャンネル・カテゴリーの作成・削除
- ロールの作成・編集
- メッセージの削除・管理
- メンバーのニックネーム変更
:::

## 初期設定

### 1. ロールの並び替え

Botを招待したら、サーバー設定からロールの順序を調整してください。

::: tip 重要
マダミナリンクのロールは、操作対象とするロール（プレイヤーロールなど）よりも**上位**に配置する必要があります。
:::

1. サーバー設定を開く
2. 「ロール」タブを選択
3. マダミナリンクのロールを操作したいロールより上にドラッグ

![サーバー設定でのロール並び替え画面](../images/guide/getting-started/role-order.png)
### 2. 動作確認

`/ping` コマンドを実行して、Botが正しく動作しているか確認しましょう。

```
/ping
```

![pingコマンドの入力](../images/guide/getting-started/ping-input.png)

Botから応答があれば、正常に動作しています。

![pingコマンドの実行結果](../images/guide/getting-started/ping-result.png)

## 基本的な流れ

1. **Botを招待** - 上記の方法でサーバーに追加
2. **ロールを並び替え** - マダミナリンクのロールを適切な位置に配置
3. **動作確認** - `/ping` で応答を確認
4. **セットアップ実行** - `/setup` でプレイ用カテゴリーを作成
5. **ゲームを進行** - 各種コマンドでGM作業をサポート
6. **ログを保存** - `/archive` でプレイログを保存
7. **後片付け** - `/delete` や `/cleanup` で不要なチャンネルを整理

## 次のステップ

- [コマンド一覧](/commands/) - 利用可能なコマンドを確認
- [/setup の使い方](/commands/setup) - セットアップコマンドの詳細

## サポート

問題が発生した場合は、以下のいずれかからお問い合わせください：

- [サポートサーバー](https://discord.gg/JMqcQstFSK)
- [X (@Madaminalink)](https://x.com/Madaminalink)
