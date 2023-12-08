FROM node:20

WORKDIR /app

#package.jsonが変更されてない場合はキャッシュで高速化される
COPY package.json package-lock.json ./
RUN npm install
ENV PATH="/app/node_modules/.bin:$PATH"

COPY . .

# コンテナの起動時にボットを起動
ENTRYPOINT [ "npm", "run", "demon" ]