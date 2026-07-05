#!/usr/bin/env bash
set -e

if [ -f package.json ] && npm run | grep -q "typecheck"; then
  echo "[hook] Running typecheck..."
  npm run typecheck
else
  echo "[hook] No typecheck script found. Skipping."
fi
