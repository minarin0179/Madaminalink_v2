#!/bin/bash
# VitePressプレビューサーバーをCloudflare Tunnelで公開してOGPを検証

echo "Building docs..."
bun run docs:build

echo "Starting preview server..."
bun run docs:preview &
PREVIEW_PID=$!
sleep 2

echo "Starting Cloudflare Tunnel..."
echo "Press Ctrl+C to stop the tunnel"
cloudflared tunnel --url http://localhost:4173

# クリーンアップ
kill $PREVIEW_PID 2>/dev/null
