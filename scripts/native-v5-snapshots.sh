#!/usr/bin/env bash
# لقطات تحقق v5 لكل مسارات الـ212 على محاكي ن1، ثم تحديث V5_TRACKING.json تلقائيًا (معيار الاحتساب في native-v5-progress.mjs --from-snapshots).
# الاستخدام: bash scripts/native-v5-snapshots.sh [مسار ...]   (بلا وسائط = كل المسارات)
set -uo pipefail
cd "$(dirname "$0")/.."
export NATIVE_WINDOW=n1
OUT=${OUT:-/tmp/n1-v5-snapshots}; mkdir -p "$OUT"
export BOARD=$OUT TICK=$OUT/ticks.txt INVALID=$OUT/invalid.txt
: > "$TICK"; : > "$INVALID"
if [ $# -gt 0 ]; then ROUTES=("$@"); else
  ROUTES=($(node -e 'JSON.parse(require("fs").readFileSync("docs/native/ROUTE_TEMPLATE_MAP.json","utf8")).routes.forEach(r=>console.log(r.path))')); fi
SNAP_WAIT=${SNAP_WAIT:-3} bash scripts/native-snapshot.sh "${ROUTES[@]}"
node scripts/native-v5-progress.mjs --from-snapshots "$OUT" --md
