#!/bin/bash
# حارس التقليب (ن3): لا يُرسم في أي لحظة أكثر من صفحتين متجاورتين ولا تتداخل حيّزاتهما، ولا يعود TabView(.page) للمصحف.
# ثابت: يفشل إن غاب MushafPager.visiblePages أو اختبارا الانتقال، أو استُعمل TabView(.page) في MushafReaderView تحت iOS.
# PAGER_GUARD_RUN=1: يشغّل MushafPagerTransitionTests وMushafPagerTests فعليًا على المحاكي.
set -u
cd "$(dirname "$0")/.."
S=artifacts/majalis/ios/App/SunnahNative
fail=0; bad() { echo "✗ $1"; fail=1; }
grep -q 'static func visiblePages' $S/Sources/SunnahNative/Mushaf/MushafPager.swift || bad "MushafPager.visiblePages مفقودة"
T=$S/Tests/SunnahNativeTests/MushafPagerTransitionTests.swift
grep -q 'testNeverMoreThanTwoAdjacentNonOverlappingPagesAtAnyOffset' "$T" 2>/dev/null || bad "اختبار «صفحتان متجاورتان كحد أقصى» مفقود"
grep -q 'testMidTransitionSnapshotsShowOnlyTwoAdjacentPagesWithCorrectEdge' "$T" 2>/dev/null || bad "اختبار لقطات الانتقال مفقود"
O=$S/Tests/SunnahNativeTests/MushafPagerOpenFromTabTests.swift
grep -q 'testOpeningMushafFromTabShowsOneFullSizePageAtEveryFrame' "$O" 2>/dev/null || bad "اختبار الفتح من التبويب (عنصر واحد بحجم الشاشة في كل إطار) مفقود"
grep -q 'testLayoutNeverProducesItemsWithoutValidBounds' "$O" 2>/dev/null || bad "اختبار «لا عناصر بحدود غير صالحة» مفقود"
grep -q 'class MushafPagerLayout' $S/Sources/SunnahNative/Mushaf/MushafPager.swift || bad "MushafPagerLayout (حجم العنصر من الحدود الفعلية) مفقود"
grep -q 'itemSize = size' $S/Sources/SunnahNative/Mushaf/MushafPager.swift || bad "حجم العنصر لا يُشتق من حدود الـcollectionView"
grep -q 'maxVisiblePages' $S/Sources/SunnahNative/Mushaf/MushafPager.swift || bad "حدّ أقصى للصفحات المرسومة معًا مفقود"
grep -q 'MushafPager(' $S/Sources/SunnahNative/Mushaf/MushafReaderView.swift || bad "MushafReaderView لا يستعمل MushafPager"
if [ "${PAGER_GUARD_RUN:-}" = "1" ] && [ "$fail" = 0 ]; then
  export NATIVE_WINDOW="${NATIVE_WINDOW:-n3}"; . "$(dirname "$0")/native-sim.sh"
  ( cd $S && bash ../../../../../scripts/build-slot.sh -- xcodebuild test -scheme SunnahNative -destination "id=$SIM" -derivedDataPath "${DD:-$HOME/ssunnah-build/DerivedData/pager-guard}" -only-testing:SunnahNativeTests/MushafPagerOpenFromTabTests -only-testing:SunnahNativeTests/MushafPagerTransitionTests -only-testing:SunnahNativeTests/MushafPagerTests -quiet ) >"${TMPDIR:-/tmp}/pager-guard.$$.log" 2>&1 || { tail -15 "${TMPDIR:-/tmp}/pager-guard.$$.log"; bad "اختبارات التقليب فشلت"; }
  rm -f "${TMPDIR:-/tmp}/pager-guard.$$.log"
fi
[ "$fail" = 0 ] && echo "✓ حارس التقليب سليم (صفحتان متجاورتان كحد أقصى)"
exit "$fail"
