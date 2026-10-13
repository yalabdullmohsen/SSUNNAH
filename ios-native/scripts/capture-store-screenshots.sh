#!/usr/bin/env bash
# يلتقط 6 لقطات App Store بالعربية على محاكٍ مخصص (لا يلمس المحاكيات المشتركة) من بناء Debug (لا Release: -snapshotRoute للتصحيح فقط).
# الاستعمال: ios-native/scripts/capture-store-screenshots.sh /path/SunnahApp.app [اسم نوع الجهاز]
# الإخراج:   ios-native/build/screenshots/ar-SA/{01-home..06-library}.png  (1320×2868 = iPhone 6.9")
# غير مُجرَّب بعد: يشغّله ن4 بعد بناء Release (انظر docs/native/store/SCREENSHOTS.md).
set -euo pipefail
APP="${1:?مسار SunnahApp.app (بناء Debug لمحاكي iphonesimulator)}"
DEVICE_TYPE="${2:-iPhone 17 Pro Max}"
BUNDLE="com.yousef.majlisilm"
WANT_SIZE="${3:-1320x2868}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${4:-$ROOT/ios-native/build/screenshots/ar-SA}"
NAME="sunnah-store-shots-$$"
mkdir -p "$OUT"; rm -f "$OUT"/*.png

TYPE_ID="$(xcrun simctl list devicetypes | grep -F "$DEVICE_TYPE (" | head -1 | sed -E 's/.*\((com\.apple[^)]*)\).*/\1/')"
[ -n "$TYPE_ID" ] || { echo "نوع الجهاز غير موجود: $DEVICE_TYPE" >&2; exit 1; }
RUNTIME="$(xcrun simctl list runtimes available | grep -E 'iOS' | tail -1 | sed -E 's/.* - (com\.apple[^ ]*)$/\1/')"
UDID="$(xcrun simctl create "$NAME" "$TYPE_ID" "$RUNTIME")"
cleanup() { xcrun simctl shutdown "$UDID" >/dev/null 2>&1 || true; xcrun simctl delete "$UDID" >/dev/null 2>&1 || true; }
trap cleanup EXIT

xcrun simctl boot "$UDID"; xcrun simctl bootstatus "$UDID" -b >/dev/null
xcrun simctl status_bar "$UDID" override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3
xcrun simctl ui "$UDID" appearance "${5:-light}"
xcrun simctl location "$UDID" set 24.7136,46.6753          # الرياض: مواقيت وقبلة معقولة
xcrun simctl install "$UDID" "$APP"
xcrun simctl privacy "$UDID" grant location "$BUNDLE" || true
# اللغة والمنطقة عربيتان لهذا التشغيل فقط (وسائط التشغيل لا تغيّر إعدادات الجهاز)
LAUNCH=(-AppleLanguages "(ar)" -AppleLocale ar_SA)

shot() { # <رقم-اسم> <مسار> — -snapshotRoute يعمل في بناء Debug فقط؛ openurl لمخطط مخصص يُظهر حوار «فتح في سنّة؟» يحجب اللقطة
  xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
  if [ "$2" = "/" ]; then xcrun simctl launch "$UDID" "$BUNDLE" "${LAUNCH[@]}" >/dev/null
  else xcrun simctl launch "$UDID" "$BUNDLE" "${LAUNCH[@]}" -snapshotRoute "$2" >/dev/null; fi
  sleep 9
  xcrun simctl io "$UDID" screenshot --type=png "$OUT/$1.png" >/dev/null
  local size; size="$(sips -g pixelWidth -g pixelHeight "$OUT/$1.png" | awk '/pixel/{a[++n]=$2} END{print a[1]"x"a[2]}')"
  [ "$size" = "$WANT_SIZE" ] || echo "تحذير: $1 بحجم $size لا $WANT_SIZE (اختر جهازًا بشاشة 6.9\")" >&2
  echo "✓ $1 ($size)"
}
shot 01-home        "/"
shot 02-mushaf      "/mushaf"
shot 03-prayer-times "/prayer-times"
shot 04-qibla       "/qibla"
shot 05-adhkar      "/adhkar"
shot 06-library     "/sources"
echo "الملفات: $OUT"
