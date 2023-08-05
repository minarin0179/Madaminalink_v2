FROM node:18

WORKDIR /app

#package.jsonが変更されてない場合はキャッシュで高速化される
COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV PATH="/app/node_modules/.bin:$PATH"

#Typescriptのデーモン化に必要
RUN pm2 install typescript

# コンテナの起動時にボットを起動
ENTRYPOINT [ "pm2", "--no-daemon", "start", "./src/bot.ts" ]