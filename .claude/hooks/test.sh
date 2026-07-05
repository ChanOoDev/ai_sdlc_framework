#!/usr/bin/env bash
set -e

if [ -f package.json ] && npm run | grep -q "test"; then
  echo "[hook] Running tests..."
  npm test
else
  echo "[hook] No test script found. Skipping."
fi
