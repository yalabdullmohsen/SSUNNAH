#!/usr/bin/env bash
if [ -z "${BUILD_SLOT_HELD:-}" ]; then exec bash "$(cd "$(dirname "$0")" && pwd)/build-slot.sh" -- bash "$0" "$@"; fi  # بوابة الخانات: ببناءين متزامنين كحد أقصى (docs/native/WORKFLOW.md)
# فحص سريع بعد دمج أي PR تصدير: scripts/native-quick-check.sh <قسم> [قسم…]
# يعيد التصدير الكامل + بوابة البيانات + بناء التطبيق وتثبيته + لقطات الأقسام المذكورة فقط (لا دورة كاملة).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
. "$(cd "$(dirname "$0")" && pwd)/native-sim.sh" || exit 2
DD="${DD:-$HOME/.majalis-tools/dd/$(basename "$PWD")}"
if git status --porcelain | grep -E "(^|/)\.build(/|$)|\.xcresult|DerivedData" >/dev/null; then echo "✗ مسار .build/xcresult/DerivedData ظاهر في git status — أضِفه لـ.gitignore ولا تُضِفه"; exit 1; fi
[ $# -ge 1 ] || { echo "usage: $0 <section>…"; exit 2; }
bash scripts/native-lint-chevron.sh || exit 1
bash scripts/native-lint-dark.sh || exit 1
bash scripts/native-plist-guard.sh || exit 1
bash scripts/native-webview-guard.sh || exit 1
bash scripts/native-gnu-guard.sh || exit 1
bash scripts/native-export-data.sh >/dev/null || { echo "فشل التصدير"; exit 1; }
node scripts/native-data-check.mjs | head -1
# أسبقية الحلّ + كل مسار في الجرد يُحلّ (RouteResolverTests) — يفشل الفحص إن فشل
( cd artifacts/majalis/ios/App/SunnahNative && bash "$ROOT/scripts/native-build-locked.sh" "$(basename "$ROOT")" "/tmp/qc-routes-$$.log" test -scheme SunnahNative -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD-pkg" -only-testing:SunnahNativeTests/RouteResolverTests )
grep -q "TEST FAILED\|build_rc=[1-9]" "/tmp/qc-routes-$$.log" && { grep -E "error:|failed" "/tmp/qc-routes-$$.log" | head -8; echo "✗ RouteResolverTests فشل"; exit 1; }
( cd ios-native && ruby scripts/generate-xcodeproj.rb >/dev/null 2>&1
  xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD" build -quiet 2>&1 | grep -E "^/.*error:" | sort -u )
xcrun simctl install "$SIM" "$DD/Build/Products/Debug-iphonesimulator/SunnahApp.app" || exit 1
scripts/native-snapshot.sh "$@"
node scripts/native-progress.mjs
