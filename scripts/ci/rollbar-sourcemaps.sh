#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

MAPS_COPY_DIR=".rollbar-sourcemaps"

case "${PROD_URL:-}" in
  http://*|https://*) ;;
  "")
    info "PROD_URL unset; skipping source map upload"
    exit 0
    ;;
  *)
    die "PROD_URL must start with http:// or https:// (got: $PROD_URL)"
    ;;
esac

if [ -z "${BNF_ROLLBAR_POST_SERVER_TOKEN:-}" ]; then
  info "BNF_ROLLBAR_POST_SERVER_TOKEN unset; skipping source map upload"
  exit 0
fi

if [ -z "${BNF_VERSION:-}" ] && [ -n "${NEXT_PUBLIC_BNF_VERSION:-}" ]; then
  export BNF_VERSION="$NEXT_PUBLIC_BNF_VERSION"
fi
require_env BNF_VERSION

test -d ".vercel/output/static" || die "Missing .vercel/output/static (run after build)"
STATIC_ROOT=".vercel/output/static"

rm -rf "$MAPS_COPY_DIR"
mkdir -p "$MAPS_COPY_DIR"

info "Copying source maps out of build output"
while IFS= read -r -d "" map_path; do
  rel_path="${map_path#$STATIC_ROOT/}"
  mkdir -p "$MAPS_COPY_DIR/$(dirname "$rel_path")"
  cp "$map_path" "$MAPS_COPY_DIR/$rel_path"
done < <(find "$STATIC_ROOT" \( -name "*.js.map" -o -name "*.css.map" \) -print0 2>/dev/null || true)

MAP_COUNT="$(find "$MAPS_COPY_DIR" \( -name "*.js.map" -o -name "*.css.map" \) 2>/dev/null | wc -l | tr -d ' ')"
if [ "${MAP_COUNT:-0}" -eq 0 ]; then
  info "No source maps found; skipping upload and cleanup"
  rm -rf "$MAPS_COPY_DIR"
  exit 0
fi

info "Removing source maps and sourceMappingURL from build output"
find "$STATIC_ROOT" \( -name "*.js.map" -o -name "*.css.map" \) -delete

find "$STATIC_ROOT" -name "*.js" -type f -exec sed -i -E '/^\/\/# sourceMappingURL=|^\/\*# sourceMappingURL=/d' {} \;
find "$STATIC_ROOT" -name "*.css" -type f -exec sed -i -E '/^\/\*# sourceMappingURL=/d' {} \;

BASE="${PROD_URL%/}"
info "Uploading to Rollbar (base=$BASE, version=$BNF_VERSION)"

COUNT=0
FAILS=0

while IFS= read -r -d "" map_path; do
  rel_path="${map_path#$MAPS_COPY_DIR/}"
  minified_path="${rel_path%.map}"
  minified_url="${BASE}/${minified_path}"

  tmp_body="$(mktemp)"
  http_code="$(
    curl -sS \
      --retry 3 --retry-all-errors \
      --connect-timeout 5 --max-time 30 \
      -o "$tmp_body" \
      -w "%{http_code}" \
      https://api.rollbar.com/api/1/sourcemap \
      -F "access_token=$BNF_ROLLBAR_POST_SERVER_TOKEN" \
      -F "version=$BNF_VERSION" \
      -F "minified_url=$minified_url" \
      -F "source_map=@$map_path" \
    || echo "curl_failed"
  )"

  if [ "$http_code" = "200" ]; then
    COUNT=$((COUNT + 1))
    info "Uploaded ${rel_path}"
  else
    FAILS=$((FAILS + 1))
    echo "▶ Failed to upload ${rel_path} (http=$http_code)" >&2
    echo "  minified_url=$minified_url" >&2

    if [ -s "$tmp_body" ]; then
      echo "  rollbar_response_snip:" >&2
      sed -n '1,120p' "$tmp_body" >&2
    fi
  fi

  rm -f "$tmp_body"
done < <(find "$MAPS_COPY_DIR" \( -name "*.js.map" -o -name "*.css.map" \) -print0 2>/dev/null || true)

rm -rf "$MAPS_COPY_DIR"

if [ "$COUNT" -gt 0 ]; then
  info "Uploaded $COUNT source map(s) to Rollbar (version=$BNF_VERSION)"
fi

if [ "$FAILS" -gt 0 ]; then
  echo "▶ Rollbar sourcemap uploads had $FAILS failure(s); see logs above." >&2
fi
