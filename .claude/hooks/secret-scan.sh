#!/usr/bin/env bash
set -e

echo "[hook] Running secret scan..."

MATCHES=$(grep -RIn \
  -E "SUPABASE_SERVICE_ROLE_KEY=.+|service_role|sk-[A-Za-z0-9]|eyJ[A-Za-z0-9_-]{20,}" \
  . \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude=".env.example" \
  --exclude="*.md" || true)

if [ -n "$MATCHES" ]; then
  echo "Potential secret detected:"
  echo "$MATCHES"
  echo "Remove secrets before continuing."
  exit 2
fi

echo "[hook] Secret scan passed."
