FROM node:18

COPY . /app

WORKDIR /app

RUN npm install

ENV PATH="/app/node_modules/.bin:$PATH"

#Typescriptのデーモン化に必要
RUN pm2 install typescript

# コンテナの起動時にボットを起動
#ENTRYPOINT [ "ts-node", "./src/bot.ts" ]
ENTRYPOINT [ "pm2", "start", "./src/bot.ts" ]