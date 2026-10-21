#!/bin/bash
# حارس تحديد الآية (ن3): الضغط المطوّل على أي كلمة تحدد الآية كلها (لا كلمة منفردة)، التظليل متصل بلا فجوات، والقائمة السفلية لا تحجب الآية.
# ثابت: يفشل إن غابت اختبارات الـ604 صفحة/اللقطات/القائمة، أو عاد التظليل لنمط كلمة-بكلمة، أو غابت أزرار القائمة (تفسير/نسخ/مشاركة/علامة).
# VERSE_GUARD_RUN=1: يشغّل MushafVerseSelectionTests وMushafSelectionSheetTests فعليًا على المحاكي.
set -u
cd "$(dirname "$0")/.."
S=artifacts/majalis/ios/App/SunnahNative
fail=0; bad() { echo "✗ $1"; fail=1; }
R=$S/Sources/SunnahNative/Mushaf/MushafReaderView.swift
A=$S/Sources/SunnahNative/Mushaf/MushafAyahActionBar.swift   # أزرار البطاقة السفلية انتقلت إليه
T=$S/Tests/SunnahNativeTests/MushafVerseSelectionTests.swift
H=$S/Tests/SunnahNativeTests/MushafSelectionSheetTests.swift
grep -q 'testTapOnAnyWordSelectsWholeAyahOnAll604Pages' "$T" 2>/dev/null || bad "اختبار «نقر كل كلمة = الآية كاملة» على الـ604 مفقود"
grep -q 'testSelectionHighlightIsContinuousAcrossLines' "$T" 2>/dev/null || bad "اختبار استمرارية التظليل مفقود"
grep -q 'testSheetStatesNeverClipOrHideSelectedAyah' "$H" 2>/dev/null || bad "اختبار القائمة السفلية (لا قطع/حجب) مفقود"
grep -q 'LongPressGesture(minimumDuration: 0.4).onEnded { _ in selectedAyah = w.v' "$R" || bad "الضغط المطوّل لم يعد يحدد الآية بمعرّفها w.v"
# قرار المالك (2026-10-19): التحديد بالضغط المطوّل فقط — النقرة العادية لا تحدد الآية
grep -q 'TapGesture().onEnded { selectedAyah' "$R" && bad "عادت النقرة العادية تحدد الآية (المطلوب: ضغط مطوّل فقط)"
grep -q 'MushafSoftBand' "$R" || bad "التظليل المتصل (شريط واحد لكل مقطع) مفقود"
for k in '/tafsir/' 'offline-player' 'ShareLink' 'copy(text)'; do grep -qF -- "$k" "$R" "$A" || bad "القائمة السفلية بلا «${k}»"; done
grep -qE 'toggleBookmark|toggleMark\(' "$R" "$A" || bad "القائمة السفلية بلا علامة (toggleMark/toggleBookmark)"
if [ "${VERSE_GUARD_RUN:-}" = "1" ] && [ "$fail" = 0 ]; then
  export NATIVE_WINDOW="${NATIVE_WINDOW:-n3}"; . "$(dirname "$0")/native-sim.sh"
  export MUSHAF_DATA="$PWD/ios-native/Data/mushaf" TEST_RUNNER_MUSHAF_DATA="$PWD/ios-native/Data/mushaf"
  ( cd $S && bash ../../../../../scripts/build-slot.sh -- xcodebuild test -scheme SunnahNative -destination "id=$SIM" -derivedDataPath "${DD:-$HOME/ssunnah-build/DerivedData/verse-guard}" -only-testing:SunnahNativeTests/MushafVerseSelectionTests -only-testing:SunnahNativeTests/MushafSelectionSheetTests -quiet ) >"${TMPDIR:-/tmp}/verse-guard.$$.log" 2>&1 || { tail -15 "${TMPDIR:-/tmp}/verse-guard.$$.log"; bad "اختبارات تحديد الآية فشلت"; }
  rm -f "${TMPDIR:-/tmp}/verse-guard.$$.log"
fi
[ "$fail" = 0 ] && echo "✓ حارس تحديد الآية سليم (آية كاملة بضغط مطوّل، تظليل متصل، قائمة لا تحجب)"
exit "$fail"
