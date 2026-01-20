#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: album-photos.sh [--source=DIR] [--output=DIR] [--bucket=NAME] [--remote=NAME] [--quality=NN] [--jobs=NN]
                       [--convert-webp] [--push] [--remove-originals] [--override]

Options:
  --source=DIR         Source folder (default: cdn).
  --output=DIR         Output folder for .webp (default: cdn-webp).
  --bucket=NAME        R2 bucket name (default: bnf-events-photos).
  --remote=NAME        rclone remote name (default: r2).
  --quality=NN         WebP quality (default: 80).
  --jobs=NN            Parallel workers (default: 4).
  --convert-webp       Convert source images to .webp.
  --push               Upload .webp files to R2.
  --remove-originals   Delete source files after successful conversion.
  --override           Overwrite existing .webp and re-upload.
EOF
}

source_dir="cdn"
output_dir="cdn-webp"
bucket="bnf-events-photos"
remote="r2"
quality=80
jobs=4
convert_webp=false
push=false
remove_originals=false
override=false

for arg in "$@"; do
  case "$arg" in
    --source=*)
      source_dir="${arg#*=}"
      ;;
    --output=*)
      output_dir="${arg#*=}"
      ;;
    --bucket=*)
      bucket="${arg#*=}"
      ;;
    --remote=*)
      remote="${arg#*=}"
      ;;
    --quality=*)
      quality="${arg#*=}"
      ;;
    --jobs=*)
      jobs="${arg#*=}"
      ;;
    --convert-webp)
      convert_webp=true
      ;;
    --push)
      push=true
      ;;
    --remove-originals)
      remove_originals=true
      ;;
    --override)
      override=true
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

if [[ "$convert_webp" == false && "$push" == false ]]; then
  echo "error: choose --convert-webp and/or --push"
  usage
  exit 1
fi

if [[ "$convert_webp" == true ]]; then
  if ! command -v cwebp >/dev/null 2>&1; then
    echo "error: cwebp is not installed or not in PATH"
    exit 1
  fi

  if [[ ! -d "$source_dir" ]]; then
    echo "error: source folder not found: $source_dir"
    exit 1
  fi

  mkdir -p "$output_dir"

  export source_dir output_dir quality remove_originals override
  find "$source_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 \
    | xargs -0 -P "$jobs" -I {} bash -c '
        input_file="$1"
        relative_path="${input_file#"$source_dir"/}"
        output_file="$output_dir/${relative_path%.*}.webp"
        output_parent="$(dirname "$output_file")"
        mkdir -p "$output_parent"

        if [[ -f "$output_file" && "$override" != true ]]; then
          echo "skip: $output_file"
          exit 0
        fi

        if cwebp -q "$quality" "$input_file" -o "$output_file" >/dev/null 2>&1; then
          echo "webp: $input_file -> $output_file"
          if [[ "$remove_originals" == true ]]; then
            rm -f "$input_file"
          fi
        else
          echo "error: failed to convert $input_file"
          exit 1
        fi
      ' _ {}
fi

if [[ "$push" == true ]]; then
  if [[ ! -d "$output_dir" ]]; then
    echo "error: output folder not found: $output_dir"
    exit 1
  fi

  if command -v rclone >/dev/null 2>&1; then
    dest="${remote}:${bucket}"
    rclone_args=(copy "$output_dir" "$dest" --transfers "$jobs" --checkers "$jobs")
    if [[ "$override" != true ]]; then
      rclone_args+=(--ignore-existing)
    fi
    rclone "${rclone_args[@]}"
  else
    if ! command -v wrangler >/dev/null 2>&1; then
      echo "error: rclone or wrangler is required for uploads"
      exit 1
    fi
    export output_dir bucket override
    find "$output_dir" -type f -iname "*.webp" -print0 \
      | xargs -0 -P "$jobs" -I {} bash -c '
          webp_file="$1"
          key="${webp_file#"$output_dir"/}"
          if [[ "$override" != true ]]; then
            if wrangler r2 object head "$bucket/$key" >/dev/null 2>&1; then
              echo "skip: $bucket/$key"
              exit 0
            fi
          fi
          wrangler r2 object put "$bucket/$key" --file "$webp_file" --content-type "image/webp"
        ' _ {}
  fi
fi
