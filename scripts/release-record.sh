#!/usr/bin/env bash
# يسجّل رفعًا ناجحًا في docs/native/release-state.json (بدل التحرير اليدوي).
# استعمال: bash scripts/release-record.sh <رقم-البناء> [YYYY-MM-DD]
# يُشغَّل بعد نجاح الرفع إلى TestFlight فقط؛ ثم ارفع CURRENT_PROJECT_VERSION في generate-xcodeproj.rb فوق هذا الرقم.
set -euo pipefail
cd "$(dirname "$0")/.."
B="${1:-}"; D="${2:-$(date +%F)}"
[[ "$B" =~ ^[0-9]+$ ]] || { echo "الاستعمال: release-record.sh <رقم-البناء> [YYYY-MM-DD]" >&2; exit 2; }
[[ "$D" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || { echo "تاريخ غير صالح: $D" >&2; exit 2; }
F=docs/native/release-state.json
PREV=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).lastUploadedBuild)' "$F")
[ "$B" -gt "$PREV" ] || { echo "رُفض: البناء $B ليس أكبر من المسجَّل $PREV" >&2; exit 1; }
VER=$(grep -E "MARKETING_VERSION|marketing_version" ios-native/scripts/generate-xcodeproj.rb | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
node -e '
const fs=require("fs"),[f,b,d,v]=process.argv.slice(1),j=JSON.parse(fs.readFileSync(f));
j.lastUploadedBuild=+b; j.uploadedAt=d; if(v) j.version=v;
fs.writeFileSync(f,JSON.stringify(j,null,2)+"\n")' "$F" "$B" "$D" "${VER:-}"
echo "سُجّل: البناء $B بتاريخ $D (كان $PREV). التالي: ارفع CURRENT_PROJECT_VERSION إلى $((B+1)) على الأقل."
