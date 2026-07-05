#!/usr/bin/env bash
set -e

if [ -f package.json ] && npm run | grep -q "lint"; then
  echo "[hook] Running lint..."
  npm run lint
else
  echo "[hook] No lint script found. Skipping."
fi
