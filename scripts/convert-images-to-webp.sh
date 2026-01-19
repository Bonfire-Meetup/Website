#!/usr/bin/env bash
set -uo pipefail

usage() {
  cat <<'EOF'
Usage: convert-webp.sh --scope=hero|featured|all [--remove-originals] [--override] [--quality=NN]

Options:
  --scope=hero|featured|all   Which set to process.
  --remove-originals          Delete source files after successful conversion.
  --override                  Overwrite existing .webp files.
  --quality=NN                WebP quality (default: 80).
EOF
}

if ! command -v cwebp >/dev/null 2>&1; then
  echo "error: cwebp is not installed or not in PATH"
  exit 1
fi

scope="all"
remove_originals=false
override=false
quality=80

for arg in "$@"; do
  case "$arg" in
    --scope=*)
      scope="${arg#*=}"
      ;;
    --remove-originals)
      remove_originals=true
      ;;
    --override)
      override=true
      ;;
    --quality=*)
      quality="${arg#*=}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $arg"
      usage
      exit 1
      ;;
  esac
done

case "$scope" in
  hero|featured|all)
    ;;
  *)
    echo "error: invalid scope: $scope"
    usage
    exit 1
    ;;
esac

paths=()
if [[ "$scope" == "hero" || "$scope" == "all" ]]; then
  paths+=("public/hero")
fi
if [[ "$scope" == "featured" || "$scope" == "all" ]]; then
  paths+=("public/library/featured")
fi

total_converted=0
total_skipped=0

find_files() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    return 0
  fi
  find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \)
}

for dir in "${paths[@]}"; do
  while IFS= read -r input_file; do
    [[ -z "$input_file" ]] && continue
    output_file="${input_file%.*}.webp"

    if [[ -f "$output_file" && "$override" != true ]]; then
      echo "${input_file} -> ${output_file} [warning]"
      total_skipped=$((total_skipped + 1))
      continue
    fi

    if cwebp -q "$quality" "$input_file" -o "$output_file" >/dev/null 2>&1; then
      echo "${input_file} -> ${output_file} [done]"
      total_converted=$((total_converted + 1))
      if [[ "$remove_originals" == true ]]; then
        rm -f "$input_file"
      fi
    else
      echo "${input_file} -> ${output_file} [error]"
      total_skipped=$((total_skipped + 1))
    fi
  done < <(find_files "$dir")
done

echo "total converted: ${total_converted}   total skipped: ${total_skipped}"
