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

# 2ج) كل مسار ديناميكي (فيه ":") يلزمه عيّنة في ROUTE_SAMPLES.json أو إدراج موثَّق في data-exemptions.json → noSample (وإلا يُفتح بمعاملات حرفية فتظهر شاشة احتياط كاذبة)
ns=$(node -e 'const f=require("fs"),m=JSON.parse(f.readFileSync("docs/native/ROUTE_SAMPLES.json")),x=(JSON.parse(f.readFileSync("docs/native/data-exemptions.json")).noSample)||{};console.log(JSON.parse(f.readFileSync("docs/native/ROUTE_TEMPLATE_MAP.json")).routes.map(r=>r.path).filter(p=>p.includes(":")&&!m[p]&&!x[p]).join(" "))')
[ -z "$ns" ] || bad "مسارات ديناميكية بلا عيّنة ولا إدراج noSample: $ns"

# 2ب) لا placeholder «هذه الشاشة قيد الإعداد»: النص مسموح فقط في تعريف RootTabView.placeholder والمستدعي الوحيد (آخر احتياط في resolve)
ph=$(grep -rn --include='*.swift' "هذه الشاشة قيد الإعداد" "$SRC" ios-native/SunnahApp | grep -v "Shell/RootTabView.swift")
[ -z "$ph" ] || bad "نص placeholder خارج RootTabView: $(echo "$ph" | cut -d: -f1,2 | tr '\n' ' ')"
phc=$(grep -rn --include='*.swift' "RootTabView.placeholder(" ios-native/SunnahApp | wc -l | tr -d ' ')
[ "$phc" -le 1 ] || bad "استدعاءات placeholder في التطبيق: $phc (المسموح 1: احتياط resolve)"
# اللقطات: أي مسار مسجَّل رفضته لقطة آخر دورة بسبب «قيد الإعداد»/PLACEHOLDER يُفشل الفحص (يُرفع في BACKLOG لصاحب الشاشة)
INV="${INVALID:-$HOME/ssunnah-board/native-loop.invalid}"
if [ -f "$INV" ]; then
  phr=$(grep -E "قيد الإعداد|PLACEHOLDER" "$INV" | cut -d'|' -f1 | sort -u)
  [ -z "$phr" ] || bad "مسارات تظهر بها «قيد الإعداد» في اللقطات: $(echo $phr | tr '\n' ' ')"
fi

# 2د) كل ملف .swift تحت ios-native/SunnahApp وامتداد الويدجت يجب أن يكون ضمن Sources في project.pbxproj المُلتزَم (وإلا يفشل بناء Release بـ«cannot find … in scope»)؛ الإصلاح: ruby ios-native/scripts/generate-xcodeproj.rb ثم أضِف project.pbxproj
PBX=ios-native/SunnahApp.xcodeproj/project.pbxproj
miss=$(find ios-native/SunnahApp artifacts/majalis/ios/App/PrayerWidget -name '*.swift' 2>/dev/null | while read -r f; do grep -qF "/* $(basename "$f") in Sources */" "$PBX" || echo "$f"; done)
[ -z "$miss" ] || bad "ملفات .swift غير مدرجة في project.pbxproj (أعد التوليد: ruby ios-native/scripts/generate-xcodeproj.rb): $(echo $miss | tr '\n' ' ')"

# 3) عدد المسارات المبنية مقابل 212
built=$(grep -c . docs/native/MERGED_BUILT.txt)
echo "المسارات في MERGED_BUILT: $built"
node scripts/native-progress.mjs | head -3

if [ "${1:-}" = "--release" ]; then
  export NATIVE_WINDOW="${NATIVE_WINDOW:-n4}"; . "$(dirname "$0")/native-sim.sh"; DD="${DD:-$HOME/ssunnah-build/DerivedData/release}"
  ( cd ios-native && ruby scripts/generate-xcodeproj.rb >/dev/null 2>&1
    xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -configuration Release -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD" build -quiet 2>&1 | grep "error:" | sort -u ) | grep -q . && bad "فشل بناء Release"
  xcrun simctl install "$SIM" "$DD/Build/Products/Release-iphonesimulator/SunnahApp.app" && xcrun simctl launch "$SIM" com.yousef.majlisilm >/dev/null || bad "فشل التثبيت/التشغيل"
fi
[ $fail = 0 ] && echo "✓ فحص Release ساكن نظيف" || exit 1
