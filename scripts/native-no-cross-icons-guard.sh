#!/usr/bin/env bash
# قرار المالك (2026-10-22): ممنوع أي أيقونة/زخرفة بخطين متقاطعين على شكل صليب أو نجمة رباعية
# (plus، cross، sparkle(s)، scalemass، staroflife، asterisk…). البدائل: النجمة الثمانية، كتاب، قبة، هلال، chevron.
# استثناء موسوم بـ `// cross-ok` في السطر نفسه.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=artifacts/majalis/ios/App
BAD=$(grep -rnE --include='*.swift' \
  '"([a-z0-9.]*\.)?(plus|cross|sparkles?|scalemass|staroflife|asterisk|plusminus)(\.[a-z0-9.]+)?"|"[a-z.]*\.(badge\.plus|plus)"|[✦✚✛✜✝✞✟☩☨✢✣✤✥✧⁜+]\s*"|"[^"]*[✦✚✛✜✝✞✟☩☨✢✣✤✥✧]' \
  $ROOT 2>/dev/null | grep -vE '/\.build/|/Tests/|cross-ok|\+ ?"|" ?\+|"\+"' || true)
if [ -n "$BAD" ]; then echo "رموز بشكل صليب/نجمة رباعية ممنوعة (قرار المالك):"; echo "$BAD" | head -20; exit 1; fi
echo "no-cross-icons-guard: OK"
