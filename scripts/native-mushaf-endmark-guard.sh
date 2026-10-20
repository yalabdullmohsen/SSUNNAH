#!/bin/bash
# حارس علامة نهاية الآية (ن3): الزخرفة بحجم المطبوع وطبقاتها (حشوة/إطار/أرقام)، ولا سطر يبدأ بعلامة نهاية.
# ثابت: الارتفاع [0.95,1.05]، العرض [0.76,0.84] من خط النص، minContrast ≥ 4.5.
# ENDMARK_GUARD_RUN=1: يشغّل الاختبار فعليًا على المحاكي.
set -u
cd "$(dirname "$0")/.."
T=artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/MushafEndMarkGuardTests.swift
fail=0; bad() { echo "✗ $1"; fail=1; }
val() { sed -n "s/.*static let $1: [A-Za-z]* = \([0-9.]*\).*/\1/p" "$T" | head -1; }
hmn=$(val minHeightOfFont); hmx=$(val maxHeightOfFont); wmn=$(val minWidthOfFont); wmx=$(val maxWidthOfFont); con=$(val minContrast)
for v in "$hmn" "$hmx" "$wmn" "$wmx" "$con"; do [ -n "$v" ] || bad "تعذّر قراءة ثوابت الحارس من $T"; done
# قرار المالك (2026-10-20): الزخرفة بحجمها الطبيعي في خط QPC (≈0.99em × 0.80em) كالمطبوع — النطاق لا يتّسع.
awk -v a="${hmn:-0}" -v b="${hmx:-9}" -v c="${wmn:-0}" -v d="${wmx:-9}" -v f="${con:-0}" 'BEGIN{exit !(a>=0.95 && b<=1.05 && c>=0.76 && d<=0.84 && f>=4.5)}' \
  || bad "ثوابت الزخرفة ضعفت: h=[$hmn,$hmx] w=[$wmn,$wmx] contrast=$con"
for f in testEndMarkMatchesPrintedSizeAndLayers testNoLineStartsWithAyahEndOnAll604Pages testEndMarkMoveKeepsWordsAndOrder; do
  grep -q "func $f" "$T" || bad "اختبار $f مفقود"
done
grep -q 'endMarksAttachedToLineEnds()' artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Mushaf/MushafRepository.swift || bad "المستودع لا يعيد علامات النهاية إلى آخر السطر"
if [ "${ENDMARK_GUARD_RUN:-}" = "1" ] && [ "$fail" = 0 ]; then
  export NATIVE_WINDOW="${NATIVE_WINDOW:-n3}"; . "$(dirname "$0")/native-sim.sh"
  export TEST_RUNNER_MUSHAF_DATA="$PWD/ios-native/Data/mushaf" MUSHAF_DATA="$PWD/ios-native/Data/mushaf"
  ( cd artifacts/majalis/ios/App/SunnahNative && bash ../../../../../scripts/build-slot.sh -- xcodebuild test -scheme SunnahNative -destination "id=$SIM" -derivedDataPath "${DD:-$HOME/ssunnah-build/DerivedData/endmark-guard}" -only-testing:SunnahNativeTests/MushafEndMarkGuardTests -quiet ) >"${TMPDIR:-/tmp}/endmark-guard.$$.log" 2>&1 || { tail -15 "${TMPDIR:-/tmp}/endmark-guard.$$.log"; bad "MushafEndMarkGuardTests فشل"; }
  rm -f "${TMPDIR:-/tmp}/endmark-guard.$$.log"
fi
[ "$fail" = 0 ] && echo "✓ حارس علامة نهاية الآية سليم (ارتفاع ${hmn}–${hmx}، عرض ${wmn}–${wmx} من الخط، تباين ≥${con})"
exit "$fail"
