---
description: ドキュメント内の貼りっぱなし画像を整理し、適切なファイル名とパスに変更する
---

指定されたマークダウンファイル内の画像を整理してください。

## 実施内容

1. **画像の検出**
   - マークダウンファイル内の画像参照を全て検出
   - 特に `![alt text](image.png)` や `![](image-1.png)` のような一般的な名前の画像を優先的に処理

2. **画像の分析と移動**
   - 各画像ファイルを読み込み、内容を確認
   - 画像の内容に基づいて適切なファイル名を決定（例：`add-app-button.png`, `role-order.png`）
   - マークダウンファイルの場所から適切な images ディレクトリ配下に移動
     - `docs/guide/` 配下のファイル → `docs/images/guide/[ファイル名]/`
     - `docs/commands/` 配下のファイル → `docs/images/commands/[コマンド名]/`

3. **マークダウンの更新**
   - 画像パスを相対パス形式に更新（例：`../images/guide/getting-started/add-app-button.png`）
   - 代替テキスト（alt text）を画像内容に基づいた説明文に変更
   - 必要に応じて画像の前後に空行を追加して見やすく整形

## 画像命名規則

- 小文字とハイフンを使用（例：`add-app-button.png`）
- 内容が分かりやすい名前にする
- 連番が必要な場合は末尾に数字（例：`setup-step-1.png`）

## 代替テキストの原則

- 画像の内容を簡潔に説明する
- スクリーンリーダー利用者にも伝わるよう具体的に記述
- 「alt text」のような一般的な文言は使用しない

## 注意事項

- 既に適切なパスと名前が付けられている画像は変更しない
- 画像ディレクトリが存在しない場合は作成する
- 元のマークダウンファイルのバックアップは不要（Git管理されているため）

## 使用例

```bash
# getting-started.md の画像を整理
/organize-doc-images docs/guide/getting-started.md

# setup.md の画像を整理
/organize-doc-images docs/commands/setup.md
```
