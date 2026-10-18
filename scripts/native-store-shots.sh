#!/usr/bin/env bash
# يلتقط لقطات المتجر كاملة (النموذج ٢): 6.9" و6.5" × فاتح وداكن = 4 مجموعات، بأسماء NN-name-{69|65}-{light|dark}.png
# يعيد استخدام ios-native/scripts/capture-store-screenshots.sh (محاكٍ مخصص، 9:41، الرياض، عربي) بمسارات هذه القائمة (SCREENSHOT_PLAN.md).
# الاستعمال: scripts/native-store-shots.sh /path/SunnahApp.app [مجلد الإخراج]   — بناء Debug من HEAD بعد دمج دفعة ن1 والتحقق.
# STORY_ROUTE=/مسار-قصة-نبي لإضافة لقطة 06 (لا مسار ثابتًا لها في ROUTE_TEMPLATE_MAP؛ تُسقَط إن لم يُعطَ). SETS="69-light 69-dark" لتضييق المجموعات.
# لا يرفع شيئًا: يبقى الرفع لـASC بيد يوسف بعد مراجعة PROVENANCE.
set -euo pipefail
APP="${1:?مسار SunnahApp.app (Debug)}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${2:-$ROOT/ios-native/build/store-shots}"
CAP="$ROOT/ios-native/scripts/capture-store-screenshots.sh"
SETS="${SETS:-69-light 69-dark 65-light 65-dark}"
# رقم|اسم|مسار — الترتيب من SCREENSHOT_PLAN.md (تحديث النموذج ٢)
SHOTS=("01|home|/" "02|mushaf|/mushaf" "03|prayer|/prayer-times" "04|sections|/sections" "05|prophets|/prophets")
[ -n "${STORY_ROUTE:-}" ] && SHOTS+=("06|story|$STORY_ROUTE")
SHOTS+=("07|adhkar|/adhkar" "08|settings|/settings")
for set in $SETS; do
  size=${set%-*}; mode=${set#*-}
  case $size in 69) dev="iPhone 17 Pro Max"; want=1320x2868;; 65) dev="iPhone 14 Plus"; want=1284x2778;; *) echo "مجموعة مجهولة: $set" >&2; exit 2;; esac
  tmp="$(mktemp -d)"
  for s in "${SHOTS[@]}"; do IFS='|' read -r n name route <<<"$s"
    # السكربت الأصل يلتقط ست لقطات ثابتة؛ نستدعيه لكل شاشة على حدة عبر مجلد مؤقت ثم نعيد التسمية
    ROUTE_ONLY="$route" bash "$CAP" "$APP" "$dev" "$want" "$tmp/$n" "$mode" >/dev/null 2>&1 || true
    f=$(ls "$tmp/$n"/*.png 2>/dev/null | head -1 || true)
    [ -n "$f" ] || { echo "✗ $n-$name ($set): لم تُلتقط" >&2; continue; }
    mkdir -p "$OUT"; cp "$f" "$OUT/$n-$name-$set.png"; echo "✓ $n-$name-$set"
  done; rm -rf "$tmp"
done
echo "الإخراج: $OUT — راجع القبول: docs/native/design/model2/ACCEPTANCE.md ثم native-shot-provenance-guard.sh"
