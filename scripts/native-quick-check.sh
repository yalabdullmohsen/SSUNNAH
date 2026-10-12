#!/usr/bin/env bash
# فحص سريع بعد دمج أي PR تصدير: scripts/native-quick-check.sh <قسم> [قسم…]
# يعيد التصدير الكامل + بوابة البيانات + بناء التطبيق وتثبيته + لقطات الأقسام المذكورة فقط (لا دورة كاملة).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
SIM="${SIM:-D6FD9993-ED1B-4659-9C3B-B74999C0F87E}"; DD="${DD:-$HOME/ssunnah-build/DerivedData/mb}"
[ $# -ge 1 ] || { echo "usage: $0 <section>…"; exit 2; }
bash scripts/native-lint-chevron.sh || exit 1
bash scripts/native-plist-guard.sh || exit 1
bash scripts/native-release-check.sh || echo "⚠ فحص Release الساكن: مسارات معلّقة (غير مانع)"
bash scripts/native-export-data.sh >/dev/null || { echo "فشل التصدير"; exit 1; }
node scripts/native-data-check.mjs | head -1
( cd ios-native && ruby scripts/generate-xcodeproj.rb >/dev/null 2>&1
  xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD" build -quiet 2>&1 | grep -E "^/.*error:" | sort -u )
xcrun simctl install "$SIM" "$DD/Build/Products/Debug-iphonesimulator/SunnahApp.app" || exit 1
scripts/native-snapshot.sh "$@"
node scripts/native-progress.mjs
