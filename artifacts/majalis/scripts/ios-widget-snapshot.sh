#!/bin/bash
# بوابة اقتطاع الودجات (ImageRenderer) + لقطات المصفوفة. تتطلب macOS + Xcode + محاكي iOS مُقلَع.
# الاستخدام: scripts/ios-widget-snapshot.sh [مجلد_الإخراج]   — تخرج بـ1 عند أي ملامسة لحافة الإطار.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/ios/App"
OUT="${1:-${TMPDIR:-/tmp}/sunnah-widget-snap}"
WORK="${TMPDIR:-/tmp}/sunnah-widget-snap-work"
SDK="$(xcrun --sdk iphonesimulator --show-sdk-path)"
SIM="${SIM_UDID:-$(xcrun simctl list devices booted | grep -Eo '[0-9A-F-]{36}' | head -1)}"
[ -n "$SIM" ] || { echo "لا محاكي مُقلَع (xcrun simctl boot <udid>)"; exit 2; }
rm -rf "$WORK/src"; mkdir -p "$WORK/src" "$OUT"
# المصادر تُنسخ وتُعاد كتابة widgetFamily (قيمة بيئة للقراءة فقط) إلى مفتاح snapFamily
for f in "$APP"/PrayerWidget/*.swift "$APP"/Shared/*.swift; do
  case "$(basename "$f")" in PrayerWidgetBundle.swift) continue;; esac
  sed 's/@Environment(\\\.widgetFamily)/@Environment(\\.snapFamily)/g' "$f" > "$WORK/src/$(basename "$f")"
done
cp "$APP/WidgetSnapshotHarness/SnapFamilyKey.swift" "$WORK/src/"
(cd "$APP/SunnahWidgetKit" && xcodebuild -scheme SunnahWidgetKit -destination 'generic/platform=iOS Simulator' -derivedDataPath "$WORK/kit" build -quiet >/dev/null)
P="$WORK/kit/Build/Products/Debug-iphonesimulator"
(cd "$WORK" && swiftc -application-extension -profile-generate -Xlinker -no_application_extension -o snap -sdk "$SDK" -target arm64-apple-ios16.2-simulator -I "$P" src/*.swift "$APP/WidgetSnapshotHarness/main.swift" "$P"/*.o 2>&1 | grep -E "error" || true)
xcrun simctl spawn "$SIM" "$WORK/snap" "$OUT"
