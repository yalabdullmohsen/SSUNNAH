#!/bin/bash
# حارس حد تماثل أقراص نهاية الآية (verse-selection / ن3): يمنع إضعاف الحد 8٪ دون أن يفشل شيء.
# ثابت: يفشل إن زاد maxAsymFrac عن 0.08 أو minAsymTol عن 2.0 أو غاب اختبار التثبيت DiscAsymThresholdTests.
# DISC_GUARD_RUN=1: يشغّل اختبار التثبيت فعليًا على المحاكي (9٪ مرفوض، 6٪ و8٪ مقبولان).
set -u
cd "$(dirname "$0")/.."
T=artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/MushafMultiSizeGuardTests.swift
fail=0; bad() { echo "✗ $1"; fail=1; }
frac=$(sed -n 's/.*maxAsymFrac = \([0-9.]*\).*/\1/p' "$T" | head -1)
tol=$(sed -n 's/.*minAsymTol = \([0-9.]*\).*/\1/p' "$T" | head -1)
[ -n "$frac" ] && [ -n "$tol" ] || bad "تعذّر قراءة maxAsymFrac/minAsymTol من $T"
awk -v f="${frac:-9}" -v t="${tol:-9}" 'BEGIN{exit !(f<=0.08 && t<=2.0)}' || bad "حد تماثل الأقراص ضعف: maxAsymFrac=$frac (الأقصى 0.08) minAsymTol=$tol (الأقصى 2.0)"
grep -q 'final class DiscAsymThresholdTests' "$T" || bad "اختبار تثبيت الحد DiscAsymThresholdTests مفقود"
grep -q 'Self.isAsymBad(diff: diff, d: m.d)' "$T" || bad "testEndOfAyahDiscsKeepClearanceFromNeighbourInk لا يستعمل isAsymBad (حد مضمَّن يتجاوز الاختبار)"
if [ "${DISC_GUARD_RUN:-}" = "1" ] && [ "$fail" = 0 ]; then
  export NATIVE_WINDOW="${NATIVE_WINDOW:-n3}"; . "$(dirname "$0")/native-sim.sh"
  ( cd artifacts/majalis/ios/App/SunnahNative && bash ../../../../../scripts/build-slot.sh -- xcodebuild test -scheme SunnahNative -destination "id=$SIM" -derivedDataPath "${DD:-$HOME/ssunnah-build/DerivedData/disc-guard}" -only-testing:SunnahNativeTests/DiscAsymThresholdTests -quiet ) >"${TMPDIR:-/tmp}/disc-guard.$$.log" 2>&1 || { tail -15 "${TMPDIR:-/tmp}/disc-guard.$$.log"; bad "DiscAsymThresholdTests فشل"; }
  rm -f "${TMPDIR:-/tmp}/disc-guard.$$.log"
fi
[ "$fail" = 0 ] && echo "✓ حارس حد الأقراص 8٪ سليم (maxAsymFrac=$frac, minAsymTol=$tol)"
exit "$fail"
