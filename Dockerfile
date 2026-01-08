# ===================================
# Base stage: 共通設定
# ===================================
FROM oven/bun:1-debian AS base
WORKDIR /app

# ===================================
# Development stage: 開発環境用
# ===================================
FROM base AS development
# 開発時はホストのソースをマウントするため、依存関係のみインストール
# devcontainer で使用

# ===================================
# Dependencies stage: 依存関係インストール
# ===================================
FROM base AS dependencies

# 本番用依存関係のインストール
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ===================================
# Build stage: ビルド用（TypeScript等のコンパイルが必要な場合）
# ===================================
FROM base AS build

# 開発用依存関係も含めてインストール
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ソースコードをコピー
COPY . .

# ビルドが必要な場合はここで実行
# RUN bun run build

# ===================================
# Production stage: 本番環境用
# ===================================
FROM base AS production

# 本番用依存関係のみコピー
COPY --from=dependencies /app/node_modules ./node_modules

# ソースコードをコピー
COPY . .

# 非rootユーザーで実行（セキュリティ向上）
USER bun

# 環境変数のデフォルト値
ENV NODE_ENV=production

CMD ["bun", "run", "demon"]
