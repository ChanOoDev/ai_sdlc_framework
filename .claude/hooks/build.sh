#!/usr/bin/env bash
set -e

if [ -f package.json ] && npm run | grep -q "build"; then
  echo "[hook] Running build..."
  npm run build
else
  echo "[hook] No build script found. Skipping."
fi
