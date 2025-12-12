#!/bin/bash
# VitePressプレビューサーバーをCloudflare Tunnelで公開してOGPを検証
# URL: https://preview.madaminalink.com

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/cloudflared-config.yml"
TUNNEL_URL="https://preview.madaminalink.com"

cleanup() {
  echo "Cleaning up..."
  kill $PREVIEW_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM

echo "Building docs with SITE_URL=$TUNNEL_URL..."
SITE_URL="$TUNNEL_URL" bun run docs:build

echo "Starting preview server..."
bun run docs:preview &
PREVIEW_PID=$!
sleep 2

echo ""
echo "=========================================="
echo "  OGP Preview: $TUNNEL_URL"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop"

cloudflared tunnel --config "$CONFIG_FILE" run

cleanup
