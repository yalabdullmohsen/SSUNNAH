#!/bin/bash
# حارس حجم/لون قرص نهاية الآية (ن3): يمنع التكبير أو التصغير المفرط أو إضعاف التباين دون أن يفشل شيء.
# ثابت: maxDiscOfFont ≤ 0.75، minDiscOfFont ≥ 0.62، cellOfFont ≤ 0.75، maxGreenPct ≤ 2.5، minGreenPct ≥ 1.8، minContrast ≥ 4.5.
# ENDMARK_GUARD_RUN=1: يشغّل الاختبار فعليًا على المحاكي.
set -u
cd "$(dirname "$0")/.."
T=artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/MushafEndMarkGuardTests.swift
fail=0; bad() { echo "✗ $1"; fail=1; }
val() { sed -n "s/.*static let $1: [A-Za-z]* = \([0-9.]*\).*/\1/p" "$T" | head -1; }
mx=$(val maxDiscOfFont); mn=$(val minDiscOfFont); cell=$(val cellOfFont); gmx=$(val maxGreenPct); gmn=$(val minGreenPct); con=$(val minContrast)
for v in "$mx" "$mn" "$cell" "$gmx" "$gmn" "$con"; do [ -n "$v" ] || bad "تعذّر قراءة ثوابت الحارس من $T"; done
awk -v a="${mx:-9}" -v b="${mn:-0}" -v c="${cell:-9}" -v d="${gmx:-9}" -v e="${gmn:-0}" -v f="${con:-0}" 'BEGIN{exit !(a<=0.75 && b>=0.62 && c<=0.75 && d<=2.5 && e>=1.8 && f>=4.5)}' \
  || bad "ثوابت القرص ضعفت: max=$mx min=$mn cell=$cell green=[$gmn,$gmx] contrast=$con"
grep -q 'func testEndMarkDiscIsSmallInsideCellAndReadable' "$T" || bad "اختبار القرص مفقود"
grep -q 'Self.minDiscOfFont' "$T" && grep -q 'Self.maxDiscOfFont' "$T" && grep -q 'Self.minContrast' "$T" || bad "الاختبار لا يفرض الحدّين/التباين"
if [ "${ENDMARK_GUARD_RUN:-}" = "1" ] && [ "$fail" = 0 ]; then
  export NATIVE_WINDOW="${NATIVE_WINDOW:-n3}"; . "$(dirname "$0")/native-sim.sh"
  export TEST_RUNNER_MUSHAF_DATA="$PWD/ios-native/Data/mushaf" MUSHAF_DATA="$PWD/ios-native/Data/mushaf"
  ( cd artifacts/majalis/ios/App/SunnahNative && bash ../../../../../scripts/build-slot.sh -- xcodebuild test -scheme SunnahNative -destination "id=$SIM" -derivedDataPath "${DD:-$HOME/ssunnah-build/DerivedData/endmark-guard}" -only-testing:SunnahNativeTests/MushafEndMarkGuardTests -quiet ) >"${TMPDIR:-/tmp}/endmark-guard.$$.log" 2>&1 || { tail -15 "${TMPDIR:-/tmp}/endmark-guard.$$.log"; bad "MushafEndMarkGuardTests فشل"; }
  rm -f "${TMPDIR:-/tmp}/endmark-guard.$$.log"
fi
[ "$fail" = 0 ] && echo "✓ حارس قرص نهاية الآية سليم (قطر ${mn}–${mx}، أخضر ${gmn}–${gmx}٪، تباين ≥${con})"
exit "$fail"
