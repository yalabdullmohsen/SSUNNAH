#!/bin/bash
# يبني أداة لقطات الويدجت (WidgetSnapshotHarness) على محاكي iOS ويشغّلها؛ ينجح فقط إن طبعت EDGE-OK.
# الاستعمال: [PRODUCTS=<Build/Products/…-iphonesimulator>] bash scripts/native-edge-check.sh [UDID]
# PRODUCTS: ناتج xcodebuild حديث لـSunnahApp على المحاكي (فيه Adhan/SunnahPrayer/SunnahWidgetKit .swiftmodule و.o)؛
# الافتراضي: أحدث مجلد كهذا تحت ~/.majalis-tools/dd. ابنِ التطبيق قبلها من نفس الشجرة كي لا تتقادم الوحدات.
set -euo pipefail
cd "$(dirname "$0")/.."
UDID="${1:-$(xcrun simctl list devices | sed -n 's/^ *n4-sim (\([0-9A-F-]*\)).*/\1/p' | head -1)}"
[ -n "$UDID" ] || { echo "✗ لا محاكي n4-sim" >&2; exit 2; }
APP=artifacts/majalis/ios/App
PRODUCTS="${PRODUCTS:-$(ls -dt "$HOME"/.majalis-tools/dd/*/Build/Products/*-iphonesimulator 2>/dev/null | while read -r d; do [ -f "$d/Adhan.o" ] && [ -f "$d/SunnahPrayer.o" ] && [ -f "$d/SunnahWidgetKit.o" ] && { echo "$d"; break; }; done)}"
[ -e "$PRODUCTS/SunnahWidgetKit.swiftmodule" ] || { echo "✗ لا ناتج بناء في PRODUCTS" >&2; exit 2; }
OUT="${TMPDIR:-/tmp}/edge-check.$$"; mkdir -p "$OUT"
SDK=$(xcrun --sdk iphonesimulator --show-sdk-path)
SRC=$( (ls $APP/PrayerWidget/*.swift | grep -v 'PrayerWidgetBundle\|PrayerTimesWidget\|WidgetIntents'; \
  ls $APP/Shared/*.swift | grep -v 'OfflineAudio\|PlaybackSession'; ls $APP/WidgetSnapshotHarness/*.swift) )
xcrun swiftc -sdk "$SDK" -target arm64-apple-ios17.0-simulator -swift-version 5 -module-name Harness \
  -I "$PRODUCTS" -o "$OUT/harness" $SRC "$PRODUCTS/Adhan.o" "$PRODUCTS/SunnahPrayer.o" "$PRODUCTS/SunnahWidgetKit.o" 2>&1 | grep -E "error" | head -15 || true
[ -x "$OUT/harness" ] || { echo "✗ فشل بناء الأداة"; exit 2; }
xcrun simctl boot "$UDID" >/dev/null 2>&1 || true
xcrun simctl bootstatus "$UDID" -b >/dev/null 2>&1 || true
export SIMCTL_CHILD_SNAP_FONTS="$PWD/$APP/PrayerWidget/Fonts"   # خطوط الثلث والرقعة للحزام
RES=$(xcrun simctl spawn "$UDID" "$OUT/harness" "$OUT/png" </dev/null 2>&1 | tail -20)
echo "$RES"
echo "$RES" | grep -qx "EDGE-OK"
