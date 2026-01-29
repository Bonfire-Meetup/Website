#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "❌ $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"
}

require_file() {
  test -f "$1" || die "Missing file: $1"
}

require_env() {
  local name="$1"
  test -n "${!name:-}" || die "Missing env var: $name"
}

info() {
  echo "▶ $*"
}

group() {
  echo "::group::$1"
}

endgroup() {
  echo "::endgroup::"
}
