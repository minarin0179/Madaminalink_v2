FROM node:20

WORKDIR /app

RUN npm install -g bun
#package.jsonが変更されてない場合はキャッシュで高速化される
COPY package.json package-lock.json ./
RUN bun install
ENV PATH="/app/node_modules/.bin:$PATH"

COPY . .

# コンテナの起動時にボットを起動
# ENTRYPOINT [ "npm", "run", "demon" ]