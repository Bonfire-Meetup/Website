#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${PROD_URL:-}}"

if [ -z "$BASE_URL" ]; then
  echo "❌ PROD_URL not set and no URL argument provided" >&2
  exit 1
fi

case "$BASE_URL" in
  http://*|https://*) ;;
  *)
    echo "❌ BASE_URL must start with http:// or https:// (got: $BASE_URL)" >&2
    exit 1
    ;;
esac

HEALTH_URL="${BASE_URL%/}/api/health"

echo "▶ Verifying health endpoint: $HEALTH_URL"

RESP="$(
  curl -sS \
    --connect-timeout 5 \
    --max-time 10 \
    --fail \
    "$HEALTH_URL"
)"

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq is required for verify.sh" >&2
  exit 1
fi

STATUS="$(jq -r '.status // empty' <<<"$RESP")"
DB="$(jq -r '.database // empty' <<<"$RESP")"
VERSION="$(jq -r '.version // empty' <<<"$RESP")"
TIMESTAMP="$(jq -r '.timestamp // empty' <<<"$RESP")"

if [ "$STATUS" != "ok" ]; then
  echo "❌ Health check failed: status=$STATUS" >&2
  exit 1
fi

if [ "$DB" != "connected" ]; then
  echo "❌ Database not connected: database=$DB" >&2
  exit 1
fi

if [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; then
  echo "❌ Version missing in health response" >&2
  exit 1
fi

if [ -z "$TIMESTAMP" ] || [ "$TIMESTAMP" = "null" ]; then
  echo "❌ Timestamp missing in health response" >&2
  exit 1
fi

echo "✅ Health check OK"
echo "   status   : $STATUS"
echo "   database : $DB"
echo "   version  : $VERSION"
echo "   timestamp: $TIMESTAMP"
