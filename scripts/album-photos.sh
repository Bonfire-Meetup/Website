#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: album-photos.sh [--source=DIR] [--output=DIR] [--bucket=NAME] [--remote=NAME] [--quality=NN] [--jobs=NN]
                       [--convert-webp] [--push] [--remove-originals] [--override] [--rename-social]
                       [--max-long-edge=NN] [--method=NN]

Options:
  --source=DIR         Source folder (default: cdn).
  --output=DIR         Output folder for .webp (default: cdn-webp).
  --bucket=NAME        R2 bucket name (default: bnf-events-photos).
  --remote=NAME        rclone remote name (default: r2).
  --quality=NN         WebP quality (default: 80). Lower (e.g. 72-78) for smaller files once size is capped.
  --method=NN          cwebp -m, 0=fast .. 6=smaller/slower (default: 6 when --max-long-edge is set, else 4).
  --jobs=NN            Parallel workers (default: 4).
  --convert-webp       Convert source images to .webp.
  --push               Upload .webp files to R2.
  --remove-originals   Delete source files after successful conversion.
  --override           Overwrite existing .webp and re-upload.
  --rename-social      With --convert-webp: name outputs #########_##################_###################_n.webp (same shape as Facebook-export stems), derived from each file's SHA-256. Requires python3.
  --max-long-edge=NN   With --convert-webp: scale down so width and height are at most NN (keeps aspect ratio). Typical album match:2048 (existing albums use ~2048px long edge). Requires python3.
EOF
}

source_dir="cdn"
output_dir="cdn-webp"
bucket="bnf-events-photos"
remote="r2"
quality=80
method=""
jobs=4
max_long_edge=""
convert_webp=false
push=false
remove_originals=false
override=false
rename_social=false

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
    --method=*)
      method="${arg#*=}"
      ;;
    --jobs=*)
      jobs="${arg#*=}"
      ;;
    --max-long-edge=*)
      max_long_edge="${arg#*=}"
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
    --rename-social)
      rename_social=true
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

  if [[ "$rename_social" == true || -n "$max_long_edge" ]] && ! command -v python3 >/dev/null 2>&1; then
    echo "error: python3 is required for --rename-social and --max-long-edge"
    exit 1
  fi

  if [[ -n "$max_long_edge" ]] && ! [[ "$max_long_edge" =~ ^[1-9][0-9]*$ ]]; then
    echo "error: --max-long-edge must be a positive integer"
    exit 1
  fi

  if [[ -z "$method" ]]; then
    if [[ -n "$max_long_edge" ]]; then
      method=6
    else
      method=4
    fi
  fi

  if [[ ! -d "$source_dir" ]]; then
    echo "error: source folder not found: $source_dir"
    exit 1
  fi

  mkdir -p "$output_dir"

  _album_max_edge_py="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/album-photo-max-edge.py"
  export source_dir output_dir quality method remove_originals override rename_social max_long_edge _album_max_edge_py
  find "$source_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 \
    | xargs -0 -P "$jobs" -I {} bash -c '
        input_file="$1"
        relative_path="${input_file#"$source_dir"/}"
        rel_dir="$(dirname "$relative_path")"
        if [[ "$rename_social" == true ]]; then
          stem=$(python3 -c "import hashlib,sys;path=sys.argv[1];h=hashlib.sha256(open(path,\"rb\").read()).hexdigest();print(\"%09d_%018d_%019d_n\"%(int(h[0:8],16)%10**9,int(h[8:24],16)%10**18,int(h[24:40],16)%10**19))" "$input_file")
          if [[ "$rel_dir" == "." ]]; then
            output_file="$output_dir/${stem}.webp"
          else
            output_file="$output_dir/$rel_dir/${stem}.webp"
          fi
        else
          output_file="$output_dir/${relative_path%.*}.webp"
        fi
        output_parent="$(dirname "$output_file")"
        mkdir -p "$output_parent"

        if [[ -f "$output_file" && "$override" != true ]]; then
          echo "skip: $output_file"
          exit 0
        fi

        resize_args=()
        if [[ -n "$max_long_edge" ]]; then
          rz=$(python3 "$_album_max_edge_py" "$input_file" "$max_long_edge") || exit 1
          if [[ -n "$rz" ]]; then
            read -r rw rh <<< "$rz"
            resize_args=(-resize "$rw" "$rh")
          fi
        fi

        if cwebp -m "$method" -q "$quality" "${resize_args[@]}" "$input_file" -o "$output_file" >/dev/null 2>&1; then
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
    rclone_args=(
      copy "$output_dir" "$dest"
      --transfers "$jobs"
      --checkers "$jobs"
      --exclude ".DS_Store"
      --exclude "**/.DS_Store"
    )
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
    find "$output_dir" -type f -iname "*.webp" ! -name ".DS_Store" -print0 \
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
