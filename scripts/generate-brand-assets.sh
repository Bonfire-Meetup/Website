#!/usr/bin/env bash
set -euo pipefail

# Script to regenerate PNG files from SVG logos and update the brand kit zip file
# Usage: ./scripts/generate-brand-assets.sh [--override]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BRAND_DIR="$PROJECT_ROOT/public/assets/brand"
ZIP_FILE="$PROJECT_ROOT/public/assets/bonfire-press-kit.zip"

# Parse arguments
OVERRIDE=false
for arg in "$@"; do
  case "$arg" in
    --override)
      OVERRIDE=true
      ;;
    --help|-h)
      echo "Usage: ./scripts/generate-brand-assets.sh [--override]"
      echo ""
      echo "Options:"
      echo "  --override    Override existing PNG files (default: skip existing)"
      echo "  --help, -h    Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Run with --help for usage information"
      exit 1
      ;;
  esac
done

echo "🎨 Bonfire Brand Asset Generator"
echo "================================="
echo ""
if [[ "$OVERRIDE" == true ]]; then
  echo "⚙️  Mode: Override existing files"
else
  echo "⚙️  Mode: Skip existing files"
fi
echo ""

# Check if ImageMagick magick is available
if ! command -v magick >/dev/null 2>&1; then
  echo "❌ Error: ImageMagick 'magick' is not installed or not in PATH"
  echo "   Install with: brew install imagemagick"
  exit 1
fi

# Check for librsvg (better SVG gradient support)
RSVG_AVAILABLE=false
if command -v rsvg-convert >/dev/null 2>&1; then
  RSVG_AVAILABLE=true
  echo "✅ Using rsvg-convert for better gradient support"
else
  echo "⚠️  rsvg-convert not found. Install for better gradient support:"
  echo "   brew install librsvg"
  echo "   Falling back to ImageMagick (may have gradient issues)"
fi
echo ""

# Check if zip is available
if ! command -v zip >/dev/null 2>&1; then
  echo "❌ Error: zip command is not available"
  exit 1
fi

echo "📂 Working directory: $BRAND_DIR"
echo ""

# Find all gradient SVG files
SVG_FILES=(
  "RGB_SVG_01_bonfire_black_gradient.svg"
  "RGB_SVG_03_bonfire_white_gradient.svg"
  "RGB_SVG_04_bonfire-prague_black_gradient.svg"
  "RGB_SVG_06_bonfire-prague_white_symbol_gradient.svg"
  "RGB_SVG_07_bonfire-zlin_black_symbol_gradient.svg"
  "RGB_SVG_09_bonfire-zlin_white_symbol_gradient.svg"
)

PNG_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

echo "🔄 Converting SVG to PNG..."
echo ""

for svg_file in "${SVG_FILES[@]}"; do
  svg_path="$BRAND_DIR/$svg_file"
  # Replace _SVG_ with _PNG_ and .svg with .png
  png_file="${svg_file/_SVG_/_PNG_}"
  png_file="${png_file%.svg}.png"
  png_path="$BRAND_DIR/$png_file"
  
  if [[ ! -f "$svg_path" ]]; then
    echo "⚠️  Skipping $svg_file (file not found)"
    ((FAILED_COUNT++))
    continue
  fi
  
  # Check if PNG already exists
  if [[ -f "$png_path" ]]; then
    if [[ "$OVERRIDE" == true ]]; then
      echo "   🗑️  Removing existing: $png_file"
      rm "$png_path"
    else
      echo "   ⏭️  Skipping: $png_file (already exists, use --override to replace)"
      ((SKIPPED_COUNT++))
      continue
    fi
  fi
  
  echo "   Converting: $svg_file → $png_file"
  
  # Convert SVG to PNG at high resolution (2x scale for better quality)
  # Using 2710x1418 (2x the original 1355x709)
  if [[ "$RSVG_AVAILABLE" == true ]]; then
    # rsvg-convert has better SVG gradient support
    if rsvg-convert -w 2710 -h 1418 -o "$png_path" "$svg_path" 2>&1; then
      echo "   ✅ Generated: $png_file"
      ((PNG_COUNT++))
    else
      echo "   ❌ Failed: $png_file"
      ((FAILED_COUNT++))
    fi
  else
    # Fallback to ImageMagick with SVG delegate
    if magick "$svg_path" -density 300 -background none -resize 2710x1418 "$png_path" 2>&1; then
      echo "   ✅ Generated: $png_file"
      ((PNG_COUNT++))
    else
      echo "   ❌ Failed: $png_file"
      ((FAILED_COUNT++))
    fi
  fi
  echo ""
done

echo "📊 Conversion Summary:"
echo "   ✅ Success: $PNG_COUNT files"
echo "   ⏭️  Skipped: $SKIPPED_COUNT files"
echo "   ❌ Failed:  $FAILED_COUNT files"
echo ""

if [[ $PNG_COUNT -eq 0 ]] && [[ $SKIPPED_COUNT -eq 0 ]]; then
  echo "❌ No PNG files were generated. Exiting."
  exit 1
fi

# Update the brand kit zip file
echo "📦 Updating brand kit zip file..."
echo ""

# Remove old zip if it exists
if [[ -f "$ZIP_FILE" ]]; then
  rm "$ZIP_FILE"
  echo "   🗑️  Removed old zip file"
fi

# Create new zip with all brand assets
cd "$BRAND_DIR"
if zip -r "$ZIP_FILE" *.svg *.png -q; then
  ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
  echo "   ✅ Created: bonfire-press-kit.zip ($ZIP_SIZE)"
else
  echo "   ❌ Failed to create zip file"
  exit 1
fi

cd "$PROJECT_ROOT"

echo ""
echo "✨ Done! Brand assets have been regenerated."
echo ""
echo "📋 Next steps:"
echo "   1. Check the updated PNG files in: public/assets/brand/"
echo "   2. Download the press kit: public/assets/bonfire-press-kit.zip"
echo "   3. Commit the changes to version control"
echo ""
