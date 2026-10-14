#!/usr/bin/env bash
# تدقيق شامل: يفتح كل مسارات ROUTE_TEMPLATE_MAP.json على محاكي النافذة (NATIVE_WINDOW=n2) ويكتب docs/native/qa/route-audit.md
# الاستعمال: NATIVE_WINDOW=n2 APP=<SunnahApp.app> bash scripts/native-route-audit.sh [حدّ-اختياري-لعدد-المسارات]
# يعيد استعمال native-snapshot.sh (OCR: تعذّر الفتح/فارغ/قيد الإعداد/بياض/نص مقطوع) بلوحة منفصلة حتى لا يلمس ticks النافذة الأخرى.
set -uo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"
export BOARD=${BOARD:-/tmp/route-audit-board}; mkdir -p "$BOARD"
export TICK="$BOARD/ok.txt" INVALID="$BOARD/invalid.txt"; : > "$TICK"; : > "$INVALID"
LIMIT=${1:-999}
node -e 'const d=JSON.parse(require("fs").readFileSync("docs/native/ROUTE_TEMPLATE_MAP.json","utf8"));d.routes.forEach(r=>console.log(r.path))' | head -"$LIMIT" > "$BOARD/routes.txt"
while read -r r; do bash scripts/native-snapshot.sh "$r" || echo "$r|misc|SNAPSHOT_FAIL" >> "$INVALID"; done < "$BOARD/routes.txt"
OUT=docs/native/qa/route-audit.md; mkdir -p "$(dirname "$OUT")"
{
  echo "# تدقيق المسارات على المحاكي"
  echo; echo "المسارات المفحوصة: $(wc -l < "$BOARD/routes.txt" | tr -d ' ') — سليمة: $(sort -u "$TICK" | wc -l | tr -d ' ') — مرفوضة: $(sort -u "$INVALID" | wc -l | tr -d ' ')"
  echo; echo "| المسار | القسم | السبب |"; echo "|---|---|---|"
  sort -u "$INVALID" | awk -F'|' '{printf "| `%s` | %s | %s |\n",$1,$2,$3}'
} > "$OUT"
echo "$OUT"
