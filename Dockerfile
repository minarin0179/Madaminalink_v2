FROM debian:bookworm as base

RUN apt-get update && apt-get install -y curl unzip nodejs at && \
    curl -fsSL https://bun.sh/install | bash && \
    atd

ENV PATH /root/.bun/bin:$PATH

FROM base as production
WORKDIR /app
#package.jsonが変更されてない場合はキャッシュで高速化される
COPY package.json yarn.lock ./
RUN bun install --production

COPY . .
CMD bun demon
