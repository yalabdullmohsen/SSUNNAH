#!/usr/bin/env bash
# فحص جاهزية Release للتطبيق الأصلي. الافتراضي: فحص ساكن فقط (آمن لكل النوافذ).
# --release: بناء Release على المحاكي وتشغيله — لدورة ن4 فقط (xcodebuild/simulator).
set -uo pipefail; mkdir -p "$HOME/.majalis-tools/logs"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
SRC="artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative"
fail=0; bad() { echo "✗ $1"; fail=1; }

# 0) رقم البناء يجب أن يكون أكبر من آخر مرفوع (docs/native/release-state.json) وإلا يرفضه App Store Connect
LASTB=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("docs/native/release-state.json")).lastUploadedBuild)')
CURB=$(grep -oE "s\['CURRENT_PROJECT_VERSION'\] = '[0-9]+'" ios-native/scripts/generate-xcodeproj.rb | grep -oE "[0-9]+'" | tr -d "'" | sort -u | head -1)
[ -n "$CURB" ] && [ "$CURB" -gt "$LASTB" ] || bad "رقم البناء ${CURB:-؟} ليس أكبر من آخر مرفوع $LASTB (docs/native/release-state.json)"

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

# 2هـ) لا معرّف خام (نمط ^[a-z]+(-[a-z]+)+$) ظاهرًا في أي شاشة: OCR اللقطات يرفضه (RAW_ID) وهنا يُفشل الإصدار؛ وعناوين تصنيفات الأذكار تُصدَّر حرفيًا
if [ -f "$INV" ]; then
  rawr=$(grep -E "RAW_ID" "$INV" | cut -d'|' -f1 | sort -u)
  [ -z "$rawr" ] || bad "مسارات يظهر بها معرّف خام في اللقطات: $(echo $rawr | tr '\n' ' ')"
fi
grep -q "adhkar/categories.json" artifacts/majalis/scripts/native/export-ios-data.mjs || bad "تصدير عناوين تصنيفات الأذكار (adhkar/categories.json) مفقود"
grep -q 'SunnahListRow(title: category.id' "$SRC/Special/AdhkarScreen.swift" && bad "AdhkarScreen يعرض category.id خامًا"

# 2د) كل ملف .swift تحت ios-native/SunnahApp وامتداد الويدجت يجب أن يكون ضمن Sources في project.pbxproj المُلتزَم (وإلا يفشل بناء Release بـ«cannot find … in scope»)؛ الإصلاح: ruby ios-native/scripts/generate-xcodeproj.rb ثم أضِف project.pbxproj
PBX=ios-native/SunnahApp.xcodeproj/project.pbxproj
miss=$(find ios-native/SunnahApp artifacts/majalis/ios/App/PrayerWidget -name '*.swift' 2>/dev/null | while read -r f; do grep -qF "/* $(basename "$f") in Sources */" "$PBX" || echo "$f"; done)
[ -z "$miss" ] || bad "ملفات .swift غير مدرجة في project.pbxproj (أعد التوليد: ruby ios-native/scripts/generate-xcodeproj.rb): $(echo $miss | tr '\n' ' ')"

# 2هـ) حجم حزمة البيانات ios-native/Data: إجمالي + أكبر 10 مجلدات؛ تحذير > 250 MB وفشل > 500 MB
DSK=$(du -sk ios-native/Data | cut -f1); DMB=$((DSK/1024))
echo "حجم ios-native/Data: ${DMB} MB — أكبر 10 مجلدات:"
du -sk ios-native/Data/* | sort -rn | head -10 | awk '{printf "  %7.1f MB  %s\n", $1/1024, $2}'
[ "${DATA_ZIP:-0}" != 1 ] || echo "المضغوط التقديري (zip): $(( $(cd ios-native && zip -qr - Data | wc -c) / 1048576 )) MB"
[ "$DMB" -le 500 ] || bad "حجم ios-native/Data ${DMB} MB يتجاوز السقف 500 MB"
[ "$DMB" -le 250 ] || echo "⚠ تحذير: حجم ios-native/Data ${DMB} MB يتجاوز 250 MB"

# 3) عدد المسارات المبنية مقابل 212
built=$(grep -c . docs/native/MERGED_BUILT.txt)
echo "المسارات في MERGED_BUILT: $built"
node scripts/native-progress.mjs | head -3

if [ "${1:-}" = "--release" ]; then
  export NATIVE_WINDOW="${NATIVE_WINDOW:-n4}"; . "$(dirname "$0")/native-sim.sh"; DD="${DD:-$HOME/ssunnah-build/DerivedData/release}"
  # الحَكَم رمز خروج xcodebuild؛ سطر Xcode 27 «failed with exit code 0 but produced no further output» ضجيج -quiet لا خطأ
  ( cd ios-native && ruby scripts/generate-xcodeproj.rb >/dev/null 2>&1
    bash ../scripts/build-slot.sh -- xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -configuration Release -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD" CODE_SIGN_IDENTITY=- AD_HOC_CODE_SIGNING_ALLOWED=YES build -quiet >$HOME/.majalis-tools/logs/native-release-build.log 2>&1 ) || bad "فشل بناء Release (انظر $HOME/.majalis-tools/logs/native-release-build.log)"
  # اختبار النقر الفعلي (XCUITest): كل بلاطة/بطاقة في الرئيسية وكل عنصر في «كل الأقسام» وروابط داخلية؛ بلا idb
  ( cd ios-native && bash ../scripts/build-slot.sh -- xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -configuration Release -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD" CODE_SIGNING_ALLOWED=NO -resultBundlePath $HOME/.majalis-tools/logs/native-ui-tests.xcresult test -only-testing:SunnahAppUITests -quiet >$HOME/.majalis-tools/logs/native-ui-tests.log 2>&1 ) || bad "فشل اختبار النقر XCUITest (انظر $HOME/.majalis-tools/logs/native-ui-tests.log)"
  xcrun simctl install "$SIM" "$DD/Build/Products/Release-iphonesimulator/SunnahApp.app" && xcrun simctl launch "$SIM" com.yousef.majlisilm >/dev/null || bad "فشل التثبيت/التشغيل"
fi
[ $fail = 0 ] && echo "✓ فحص Release ساكن نظيف" || exit 1
