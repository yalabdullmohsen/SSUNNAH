#!/usr/bin/env bash
# تجهيز بناء TestFlight (لا رفع أبدًا): فحص رقم الإصدار/البناء والتوقيع وprivacy manifest والحجم وrelease-check وتشغيل أول نظيف،
# ثم (اختياريًا) أرشفة محلية. الأرشفة تتطلب --archive وOWNER_APPROVED_ARCHIVE=1 (إذن المالك الصريح)؛ الرفع إلى App Store Connect يدوي من المالك.
# استعمال: bash scripts/native-archive-prepare.sh [--set-version X.Y.Z --build N] [--clean-run] [--size-app PATH.app] [--archive]
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
GEN=ios-native/scripts/generate-xcodeproj.rb
PBX=ios-native/SunnahApp.xcodeproj/project.pbxproj
LOGS="$HOME/.majalis-tools/logs"; mkdir -p "$LOGS"
BID=com.yousef.majlisilm
fail=0; ok() { echo "✓ $1"; }; bad() { echo "✗ $1"; fail=1; }; warn() { echo "⚠ $1"; }
SETV=""; SETB=""; CLEAN=0; ARCH=0; APP_PATH=""
while [ $# -gt 0 ]; do case "$1" in
  --set-version) SETV=$2; shift 2;; --build) SETB=$2; shift 2;; --clean-run) CLEAN=1; shift;;
  --size-app) APP_PATH=$2; shift 2;; --archive) ARCH=1; shift;; *) echo "وسيط غير معروف: $1" >&2; exit 2;; esac; done

# 1) الإصدار والبناء: قيمة واحدة للتطبيق والويدجت (مصدرها generate-xcodeproj.rb)
if [ -n "$SETV" ] || [ -n "$SETB" ]; then
  [ -n "$SETV" ] && [ -n "$SETB" ] || { echo "--set-version يلزمه --build" >&2; exit 2; }
  [[ "$SETV" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ && "$SETB" =~ ^[0-9]+$ ]] || { echo "صيغة غير صحيحة (X.Y.Z و N رقم)" >&2; exit 2; }
  sed -i '' -E "s/(s\['MARKETING_VERSION'\] = ')[0-9.]+(')/\1$SETV\2/; s/(s\['CURRENT_PROJECT_VERSION'\] = ')[0-9]+(')/\1$SETB\2/" "$GEN"
  ( cd ios-native && ruby scripts/generate-xcodeproj.rb >/dev/null 2>&1 ) && echo "حُدّث الإصدار إلى $SETV ($SETB) وأُعيد توليد pbxproj — أضِفه في commit"
fi
VERS=$(grep -oE "s\['MARKETING_VERSION'\] = '[0-9.]+'" "$GEN" | grep -oE "[0-9.]+'" | tr -d "'" | sort -u)
BLDS=$(grep -oE "s\['CURRENT_PROJECT_VERSION'\] = '[0-9]+'" "$GEN" | grep -oE "[0-9]+'" | tr -d "'" | sort -u)
[ "$(echo "$VERS" | wc -l | tr -d ' ')" = 1 ] && [ "$(echo "$BLDS" | wc -l | tr -d ' ')" = 1 ] && ok "الإصدار $VERS (بناء $BLDS) موحّد بين التطبيق والويدجت" || bad "إصدار/بناء غير موحّد: $VERS / $BLDS"
grep -qE "MARKETING_VERSION = $VERS;" "$PBX" && grep -qE "CURRENT_PROJECT_VERSION = $BLDS;" "$PBX" || bad "pbxproj لا يطابق المولِّد (شغّل ruby ios-native/scripts/generate-xcodeproj.rb)"
LASTB=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("docs/native/release-state.json")).lastUploadedBuild)')
[ "$BLDS" -gt "$LASTB" ] && ok "البناء $BLDS أكبر من آخر مرفوع $LASTB" || bad "البناء $BLDS ليس أكبر من آخر مرفوع $LASTB (docs/native/release-state.json)"
LAST=$(git tag -l 'native-v*' --sort=-v:refname | head -1)
[ -n "$LAST" ] && echo "آخر وسم إصدار: $LAST (يجب أن يكون البناء أكبر من آخر مرفوع في App Store Connect)" || warn "لا وسم native-v* سابق: تأكد يدويًا أن رقم البناء $BLDS أكبر من آخر مرفوع"

# 2) التوقيع: الفريق والـentitlements (الشهادات/ملفات التوفير لا تدخل المستودع)
grep -qE "DEVELOPMENT_TEAM = 5D8TX37HTS" "$PBX" && ok "DEVELOPMENT_TEAM مضبوط" || bad "DEVELOPMENT_TEAM مفقود"
for e in ios-native/SunnahApp/SunnahApp.entitlements artifacts/majalis/ios/App/PrayerWidget/PrayerWidget.entitlements ios-native/SunnahWatchResources/SunnahWatch.entitlements ios-native/SunnahWatchResources/SunnahWatchComplications.entitlements; do
  plutil -lint "$e" >/dev/null 2>&1 && ok "entitlements صالح: $(basename "$e")" || bad "entitlements مفقود/تالف: $e"; done
if security find-identity -v -p codesigning 2>/dev/null | grep -qE "Apple Distribution|iPhone Distribution"; then ok "شهادة توزيع موجودة في keychain هذا الجهاز"; else warn "لا شهادة توزيع في keychain هنا — الأرشفة/الرفع يحتاجان حساب المالك (Automatic signing)"; fi

# 3) privacy manifest للتطبيق والويدجت: صالح ويعلن عدم التتبع ولا يحوي مجالات تتبع
for m in ios-native/SunnahApp/PrivacyInfo.xcprivacy ios-native/PrayerWidgetResources/PrivacyInfo.xcprivacy ios-native/SunnahWatchResources/PrivacyInfo.xcprivacy; do
  if plutil -lint "$m" >/dev/null 2>&1; then
    [ "$(plutil -extract NSPrivacyTracking raw "$m" 2>/dev/null)" = false ] && ok "$(basename "$(dirname "$m")")/PrivacyInfo: tracking=false" || bad "$m: NSPrivacyTracking ليس false"
    plutil -extract NSPrivacyAccessedAPITypes raw "$m" >/dev/null 2>&1 && ok "$(basename "$(dirname "$m")"): الأسباب المطلوبة للـAPIs معلنة" || bad "$m: NSPrivacyAccessedAPITypes مفقود"
  else bad "privacy manifest مفقود/تالف: $m"; fi; done

# 4) الحجم: التطبيق المبني (Release) إن وُجد؛ سقف تحذير 200MB (تحميل خلوي) وفشل > 400MB
[ -n "$APP_PATH" ] || APP_PATH=$(ls -d "$HOME"/.majalis-tools/dd/*/Build/Products/Release-iphonesimulator/SunnahApp.app 2>/dev/null | head -1)
if [ -n "$APP_PATH" ] && [ -d "$APP_PATH" ]; then
  MB=$(( $(du -sk "$APP_PATH" | cut -f1) / 1024 )); echo "حجم $APP_PATH: ${MB} MB — الأكبر:"; du -sk "$APP_PATH"/* | sort -rn | head -5 | awk '{printf "  %7.1f MB  %s\n",$1/1024,$2}'
  [ "$MB" -le 400 ] && ok "الحجم ${MB}MB ≤ 400" || bad "الحجم ${MB}MB > 400"; [ "$MB" -le 200 ] || warn "الحجم ${MB}MB > 200MB (يلزم wifi للتحميل الأولي على بعض الأجهزة؛ الخطوط ~153MB مقصودة)"
else warn "لا .app مبني للقياس — مرّر --size-app أو ابنِ Release أولًا"; fi

# 5) native-release-check ساكن
bash scripts/native-release-check.sh >"$LOGS/release-check.log" 2>&1 && ok "native-release-check أخضر" || { bad "native-release-check فشل (انظر $LOGS/release-check.log)"; tail -5 "$LOGS/release-check.log"; }
bash scripts/check-no-sim-delete.sh >/dev/null 2>&1 && ok "لا حذف محاكيات في السكربتات" || bad "check-no-sim-delete فشل"

# 6) تشغيل أول نظيف على محاكي النافذة: إزالة التطبيق (بياناته فقط) ثم تثبيت وتشغيل؛ لا انهيار خلال 8 ثوانٍ ولا .ips جديد
if [ "$CLEAN" = 1 ]; then
  : "${SIM_UDID:?حدّد SIM_UDID لمحاكي النافذة (لا يُحذف أي محاكٍ هنا)}"
  [ -d "${APP_PATH:-}" ] || bad "لا .app للتشغيل النظيف" 
  xcrun simctl uninstall "$SIM_UDID" $BID >/dev/null 2>&1; xcrun simctl install "$SIM_UDID" "$APP_PATH" && xcrun simctl launch "$SIM_UDID" $BID -AppleLanguages "(ar)" >/dev/null
  sleep 8; DIAG="$HOME/Library/Logs/DiagnosticReports"; NEWIPS=$(find "$DIAG" -name 'SunnahApp*.ips' -mmin -1 2>/dev/null | head -1)
  LIVE=$(xcrun simctl spawn "$SIM_UDID" launchctl list 2>/dev/null | grep "UIKitApplication:$BID" || true)
  if [ -n "$LIVE" ] && [ -z "$NEWIPS" ]; then ok "تشغيل أول نظيف: التطبيق حي بلا تقرير انهيار"; else bad "التشغيل الأول: التطبيق غير حي أو انهيار ${NEWIPS:-}"; fi
fi

# 7) الأرشفة المحلية (بلا رفع): بإذن المالك الصريح فقط
if [ "$ARCH" = 1 ]; then
  [ "${OWNER_APPROVED_ARCHIVE:-0}" = 1 ] || { echo "رفض: الأرشفة تتطلب OWNER_APPROVED_ARCHIVE=1 بعد إذن المالك الصريح (لا TestFlight دون إذن)" >&2; exit 3; }
  [ $fail = 0 ] || { echo "رفض: افحص الإخفاقات أعلاه أولًا" >&2; exit 1; }
  # الحزمة النهائية: RC_FINAL=1 يشترط بوابة الحراس (docs/native/required-guards.json)؛ RC التجريبي يتجاوزها
  [ "${RC_FINAL:-0}" != 1 ] || bash scripts/native-rc-gate.sh || { echo "رفض: بوابة RC مغلقة" >&2; exit 1; }
  OUT="$HOME/.majalis-tools/archives/SunnahApp-$VERS-$BLDS.xcarchive"; mkdir -p "$(dirname "$OUT")"
  ( cd ios-native && bash ../scripts/build-slot.sh -- xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -configuration Release -destination 'generic/platform=iOS' -archivePath "$OUT" -allowProvisioningUpdates archive -quiet ) && python3 scripts/native-capabilities-check.py "$OUT/Products/Applications/SunnahApp.app" && echo "أُرشف: $OUT — الرفع من Xcode Organizer بيد المالك" || { echo "فشلت الأرشفة" >&2; exit 1; }
fi
[ $fail = 0 ] && echo "✓ جاهز للرفع (بعد إذن المالك وقائمة docs/native/RELEASE.md)" || { echo "✗ غير جاهز" >&2; exit 1; }
