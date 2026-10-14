#!/usr/bin/env bash
# يحوّل مخرجات native-audit-fast.sh (الحلقة السريعة) إلى هيئة native-v5-progress.mjs --from-snapshots:
#   OUT/ticks.txt = مسارات حكمها OK، OUT/invalid.txt = غيرها (مسار|سبب)، OUT/snapshots/misc/<slug>-light.png = اللقطة.
# الاستخدام: BOARD=<مجلد native-audit-fast/light-large> OUT=<مجلد الخرج> bash scripts/native-v5-from-audit.sh
set -uo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"
B=${BOARD:?BOARD}; OUT=${OUT:?OUT}; mkdir -p "$OUT/snapshots/misc"; : > "$OUT/ticks.txt"; : > "$OUT/invalid.txt"
while IFS=$'\t' read -r route comp v; do
  slug=$(echo "${route#/}" | tr '/:' '__'); [ -z "$slug" ] && slug=root
  [ -s "$B/shots/$slug.png" ] && cp "$B/shots/$slug.png" "$OUT/snapshots/misc/$slug-light.png"
  if [ "$v" = OK ]; then echo "$route" >> "$OUT/ticks.txt"; else echo "$route|misc|$v" >> "$OUT/invalid.txt"; fi
done < "$B/verdicts.tsv"
node scripts/native-v5-progress.mjs --from-snapshots "$OUT"
