#!/bin/bash

# パッケージのインストール
bun install

# .env ファイルの存在を確認
if [ ! -f .env ]; then
  # .env ファイルが存在しない場合の処理
  echo "環境変数の設定を行います"
  read -p "Botのアクセストークンを入力してください>" TOKEN
  read -p "開発用サーバのIDを入力してください>" DEV_SERVER_ID
  cat << EOF > .env
TOKEN=$TOKEN
DEV_SERVER_ID=$DEV_SERVER_ID
MONGODB=mongodb://mongodb:27017/agenda
TZ=Asia/Tokyo
EOF
fi
