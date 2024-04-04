FROM debian

WORKDIR /app

RUN apt-get update && apt-get install -y curl unzip nodejs git-all
RUN curl -fsSL https://bun.sh/install | bash
# ENV PATH="~/.bun/bin:${PATH}"

#package.jsonが変更されてない場合はキャッシュで高速化される
COPY package.json package-lock.json ./
RUN ~/.bun/bin/bun install

# COPY . .

# コンテナの起動時にボットを起動
# ENTRYPOINT [ "npm", "run", "demon" ]
