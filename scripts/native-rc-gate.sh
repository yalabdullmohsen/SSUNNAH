#!/usr/bin/env bash
# بوابة RC (حارس finalOnly يُشترط عند RC_FINAL=1 فقط، فيبقى النهائي مغلقًا حتى يوجد؛ قرار يوسف 2026-10-16): لا حزمة نهائية قبل أن يكون كل حارس في docs/native/required-guards.json موجودًا ومربوطًا بـnative-release-check.sh (يفشل البناء عند المخالفة) وأن الفحص كله نظيف.
set -uo pipefail; ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
RC=scripts/native-release-check.sh; fail=0; bad() { echo "✗ $1"; fail=1; }
while IFS=$'\t' read -r id owner match; do
  f=$(ls scripts 2>/dev/null | grep -E "$match" | head -1)
  if [ -z "$f" ]; then bad "الحارس «${id}» (${owner}) غير موجود (match: $match)"; continue; fi
  grep -F "$f" "$RC" | grep -qE 'bad|\|\| *fail=1|\|\| *exit' || bad "الحارس «${id}» (${f}) غير مربوط في ${RC} بسطر يُفشل الفحص"
  [ "$fail" = 1 ] || echo "✓ $id → ${f}"
done < <(node -e 'for(const g of JSON.parse(require("fs").readFileSync("docs/native/required-guards.json")).guards)if(!g.finalOnly||process.env.RC_FINAL==="1")console.log([g.id,g.owner,g.match].join("\t"))')
bash "$RC" >/dev/null 2>&1 && echo "✓ native-release-check نظيف" || bad "native-release-check يفشل"
bash scripts/native-stale-prs.sh --strict || bad "PR متعارض متروك على native-app (انظر الجدول)"
bash scripts/native-static-links-check.sh || bad "رابط ثابت في التطبيق لا يعيد 200 (scripts/native-static-links-check.sh)"
[ $fail = 0 ] && echo "✓ بوابة RC مفتوحة" || { echo "✗ بوابة RC مغلقة" >&2; exit 1; }
