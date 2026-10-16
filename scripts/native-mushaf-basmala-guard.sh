#!/bin/bash
# حارس البسملة (ن3): حجمها واحد في كل السور (نسبة ثابتة من عرض السطر لا حجم الصفحة)، نوع السطر "b" من تخطيط QPC لا من النص.
# BASMALA_GUARD_RUN=1: يشغّل MushafBasmalaGuardTests فعليًا (يتضمن اختبار الطفرة الذي يفشل على الكود القديم).
set -u
cd "$(dirname "$0")/.."
S=artifacts/majalis/ios/App/SunnahNative
fail=0; bad() { echo "✗ $1"; fail=1; }
R=$S/Sources/SunnahNative/Mushaf/MushafReaderView.swift
M=$S/Sources/SunnahNative/Mushaf/MushafMetrics.swift
T=$S/Tests/SunnahNativeTests/MushafBasmalaGuardTests.swift
grep -q 'testBasmalaSizeIsIdenticalAcrossAllSurahs' "$T" 2>/dev/null || bad "اختبار توحيد حجم البسملة مفقود"
grep -q 'الطفرة (حجم الصفحة) لم تتفاوت' "$T" 2>/dev/null || bad "فحص الطفرة (فشل على الكود القديم) مفقود"
grep -q 'BasmalaView(repo: repo, fontSize: MushafMetrics.basmalaFontSize(width: width))' "$R" || bad "البسملة لا تستعمل الحجم الموحّد basmalaFontSize"
grep -q 'case "b":' "$R" || bad "نوع سطر البسملة لم يعد من تخطيط QPC (k == b)"
grep -q 'static func basmalaFontSize(width' "$M" || bad "basmalaFontSize مفقودة"
if [ "${BASMALA_GUARD_RUN:-}" = "1" ] && [ "$fail" = 0 ]; then
  export NATIVE_WINDOW="${NATIVE_WINDOW:-n3}"; . "$(dirname "$0")/native-sim.sh"
  export MUSHAF_DATA="$PWD/ios-native/Data/mushaf" TEST_RUNNER_MUSHAF_DATA="$PWD/ios-native/Data/mushaf"
  ( cd $S && bash ../../../../../scripts/build-slot.sh -- xcodebuild test -scheme SunnahNative -destination "id=$SIM" -derivedDataPath "${DD:-$HOME/ssunnah-build/DerivedData/basmala-guard}" -only-testing:SunnahNativeTests/MushafBasmalaGuardTests -quiet ) >"${TMPDIR:-/tmp}/basmala-guard.$$.log" 2>&1 || { tail -15 "${TMPDIR:-/tmp}/basmala-guard.$$.log"; bad "اختبارات البسملة فشلت"; }
  rm -f "${TMPDIR:-/tmp}/basmala-guard.$$.log"
fi
[ "$fail" = 0 ] && echo "✓ حارس البسملة سليم (حجم واحد في الـ112 سورة)"
exit "$fail"
