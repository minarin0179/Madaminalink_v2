#!/bin/bash
# VitePressプレビューサーバーをCloudflare Quick Tunnelで公開してOGPを検証
# 毎回ランダムなURLが生成される（*.trycloudflare.com）
# ログイン不要で使用可能

set -e

TUNNEL_LOG=$(mktemp)
TUNNEL_PID=""
PREVIEW_PID=""

cleanup() {
  echo ""
  echo "Cleaning up..."
  [ -n "$PREVIEW_PID" ] && kill $PREVIEW_PID 2>/dev/null
  [ -n "$TUNNEL_PID" ] && kill $TUNNEL_PID 2>/dev/null
  rm -f "$TUNNEL_LOG"
  exit 0
}
trap cleanup INT TERM EXIT

echo "Starting Cloudflare Quick Tunnel..."
cloudflared tunnel --url http://localhost:4173 2>&1 | tee "$TUNNEL_LOG" &
TUNNEL_PID=$!

# トンネルURLが出力されるまで待機
echo "Waiting for tunnel URL..."
TUNNEL_URL=""
for i in {1..30}; do
  TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -1)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "Error: Failed to get tunnel URL"
  exit 1
fi

echo ""
echo "=========================================="
echo "  Tunnel URL: $TUNNEL_URL"
echo "=========================================="
echo ""

echo "Building docs with SITE_URL=$TUNNEL_URL..."
SITE_URL="$TUNNEL_URL" bun run docs:build

echo ""
echo "Starting preview server..."
bun run docs:preview &
PREVIEW_PID=$!
sleep 2

echo ""
echo "=========================================="
echo "  OGP Preview Ready!"
echo "  URL: $TUNNEL_URL"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop"

# トンネルプロセスが終了するまで待機
wait $TUNNEL_PID
