#!/usr/bin/env bash
# فحص جاهزية Release للتطبيق الأصلي. الافتراضي: فحص ساكن فقط (آمن لكل النوافذ).
# --release: بناء Release على المحاكي وتشغيله — لدورة ن4 فقط (xcodebuild/simulator).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
SRC="artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative"
fail=0; bad() { echo "✗ $1"; fail=1; }

# 1) لا شاشات معلّقة: pendingIDs فارغة
pend=$(awk '/static let pendingIDs/{f=1} f{print} f&&/\]/{exit}' "$SRC/Sections/quran/QuranScreens+Native.swift" | grep -o '"[^"]*"' | tr -d '"')
[ -z "$pend" ] || bad "شاشات معلّقة (قيد الإعداد): $(echo $pend | tr '\n' ' ')"

# 2) لا علم إظهار غير المكتمل في أي ملف مصدر أو plist
grep -rqs --include='*.swift' --include='*.plist' "showUnfinished" "$SRC" ios-native && bad "وُجد sunnah.internal.showUnfinished"

# 3) عدد المسارات المبنية مقابل 212
built=$(grep -c . docs/native/MERGED_BUILT.txt)
echo "المسارات في MERGED_BUILT: $built"
node scripts/native-progress.mjs | head -3

if [ "${1:-}" = "--release" ]; then
  SIM="${SIM:-D6FD9993-ED1B-4659-9C3B-B74999C0F87E}"; DD="${DD:-$HOME/ssunnah-build/DerivedData/release}"
  ( cd ios-native && ruby scripts/generate-xcodeproj.rb >/dev/null 2>&1
    xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -configuration Release -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD" build -quiet 2>&1 | grep "error:" | sort -u ) | grep -q . && bad "فشل بناء Release"
  xcrun simctl install "$SIM" "$DD/Build/Products/Release-iphonesimulator/SunnahApp.app" && xcrun simctl launch "$SIM" com.yousef.majlisilm >/dev/null || bad "فشل التثبيت/التشغيل"
fi
[ $fail = 0 ] && echo "✓ فحص Release ساكن نظيف" || exit 1
