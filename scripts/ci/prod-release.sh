#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

group "Sanity"
require_cmd bun
require_cmd bunx
endgroup

group "Environment"
require_env GITHUB_SHA
require_env VERCEL_TOKEN
require_env VERCEL_ORG_ID
require_env VERCEL_PROJECT_ID
require_env PROD_URL
endgroup

group "Build version"
BNF_VERSION="${GITHUB_SHA:0:12}"
export BNF_VERSION
export NEXT_PUBLIC_BNF_VERSION="$BNF_VERSION"

info "Build version: $BNF_VERSION"
endgroup

group "Vercel pull"
info "Pulling Vercel project settings"
bunx vercel@latest pull --yes --environment=production --token="$VERCEL_TOKEN"
require_file ".vercel/.env.production.local"

group "Vercel env sanity"
grep -q '^NEXT_PUBLIC_' .vercel/.env.production.local || info "No NEXT_PUBLIC_* in pulled env (suspicious)"
grep -q '^BNF_NEON_MIGRATION_DATABASE_URL=' .vercel/.env.production.local || info "No migration DB URL in pulled env (migrations may fail)"
grep -q '^BNF_ROLLBAR_POST_SERVER_TOKEN=' .vercel/.env.production.local || info "No Rollbar token in pulled env (sourcemap upload may fail)"
endgroup

info "Injecting build version into env"
{
  echo ""
  echo "# Build-stamp override from GH Actions"
  echo "NEXT_PUBLIC_BNF_VERSION=$NEXT_PUBLIC_BNF_VERSION"
  echo "BNF_VERSION=$NEXT_PUBLIC_BNF_VERSION"
} >> .vercel/.env.production.local
endgroup

group "Build"
info "Building (Vercel prebuilt)"
bunx dotenv-cli -e .vercel/.env.production.local -- \
  bunx vercel@latest build --prod --token="$VERCEL_TOKEN"
endgroup

group "Rollbar sourcemaps"
bunx dotenv-cli -e .vercel/.env.production.local -- \
  bash "$SCRIPT_DIR/rollbar-sourcemaps.sh"
endgroup

group "Migrations"
info "Checking migrations"
set +u
# shellcheck disable=SC1091
source .vercel/.env.production.local
set -u

if [ -n "${BNF_NEON_MIGRATION_DATABASE_URL:-}" ]; then
  info "Running Drizzle migrations"
  bunx dotenv-cli -e .vercel/.env.production.local -- \
    bash -lc 'bunx drizzle-kit migrate' \
    2>&1 | tee drizzle-migrate.log
else
  info "No migration DB URL; skipping migrations"
fi
endgroup

group "Deploy"
info "Deploying prebuilt output"
bunx vercel@latest deploy \
  --prebuilt \
  --archive=tgz \
  --prod \
  --token="$VERCEL_TOKEN"
endgroup

info "✅ Production release completed"
