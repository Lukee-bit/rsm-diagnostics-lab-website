#!/usr/bin/env bash
# Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/assets"
OUT="$ASSETS/optimized"
CWEBP="${CWEBP:-/opt/homebrew/bin/cwebp}"
AVIFENC="${AVIFENC:-/opt/homebrew/bin/avifenc}"

mkdir -p "$OUT"

resize_png() {
  local src="$1"
  local width="$2"
  local dest="$3"
  sips --resampleWidth "$width" "$src" --out "$dest" >/dev/null
}

emit_variants() {
  local src="$1"
  local base="$2"
  shift 2
  local widths=("$@")

  for width in "${widths[@]}"; do
    local tmp="$OUT/.tmp-${base}-${width}.png"
    local webp="$OUT/${base}-${width}w.webp"
    local avif="$OUT/${base}-${width}w.avif"

    resize_png "$src" "$width" "$tmp"
    "$CWEBP" -quiet -q 85 -m 6 "$tmp" -o "$webp"
    "$AVIFENC" -q 45 -a end-usage=q "$tmp" "$avif" >/dev/null 2>&1
    rm -f "$tmp"
    echo "  ${base}-${width}w  $(wc -c <"$webp" | tr -d ' ')B webp  $(wc -c <"$avif" | tr -d ' ')B avif"
  done
}

echo "Generating optimized images in $OUT"
echo "RSM logo"
emit_variants "$ASSETS/RSM_LOGO-320.png" "RSM_LOGO" 96 160 192
echo "Kolims logo"
emit_variants "$ASSETS/Kolims_LOGO-216.png" "Kolims_LOGO" 72 144
echo "Total GI logo"
emit_variants "$ASSETS/Total_GI_logo-900.png" "Total_GI_logo" 112 224 320 448
echo "EGHA logo"
emit_variants "$ASSETS/EGHA_logo-900.png" "EGHA_logo" 112 224 320 448
echo "Upper Respiratory logo"
emit_variants "$ASSETS/Upper_Respiratory_Microscreen_Logo-400.png" "Upper_Respiratory_logo" 88 176 320 400

echo "Done."
