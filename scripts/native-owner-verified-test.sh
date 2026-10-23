#!/usr/bin/env bash
# يثبت: needs-owner لا يُضاف إلا عند غياب (وسم visually-verified + ملكية النافذة لكل الملفات المحمية)
cd "$(dirname "$0")/.." || exit 2
M=artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Mushaf/MushafView.swift
export OWNER_APPROVAL_FILE=/nonexistent/OWNER_APPROVAL.md   # الاختبارات الأصلية بلا موافقة دائمة
t() { exp=$1; shift; printf '%s\n' "$FILES" | node scripts/native-owner-verified.mjs "$@" >/dev/null 2>&1; rc=$?; [ $rc = "$exp" ] || { echo "✗ $* (توقّعت $exp وجاء $rc)"; exit 1; }; }
FILES=$M;  t 0 n3/mushaf-perf "native-section,visually-verified"   # مالك المسار + الوسم ⇒ إعفاء
FILES=$M;  t 1 n3/mushaf-perf "native-section"                     # بلا الوسم ⇒ needs-owner
FILES=$M;  t 0 n1/design      "visually-verified"                  # مسار مملوك لنافذة أخرى + الوسم ⇒ إعفاء (قرار المالك)
FILES=artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/QuranTextGuardTests.swift; t 0 n1/design-prophets "visually-verified"  # اختبار القرآن مملوك لـn3
FILES=$M;  t 1 feature/x      "visually-verified"                  # فرع بلا نافذة ⇒ needs-owner
FILES=$(printf '%s\n%s' "$M" "scripts/other.sh"); t 1 n3/mushaf-perf "visually-verified"  # ملف بلا مالك ⇒ needs-owner
FILES=""; t 1 n3/mushaf-perf "visually-verified"                   # لا ملفات ⇒ لا إعفاء
# موافقة المالك الدائمة: تُعفي ملفًا بلا مالك، وتستثني بيانات القرآن
AP=$(mktemp); trap 'rm -f "$AP"' EXIT; export OWNER_APPROVAL_FILE=$AP
FILES=$(printf '%s\n%s' "$M" "scripts/other.sh"); t 0 n3/mushaf-perf "visually-verified"   # موافقة + وسم ⇒ إعفاء
FILES=$M;  t 1 n3/mushaf-perf "native-section"                                        # موافقة بلا الوسم ⇒ needs-owner
FILES=$M;  t 1 feature/x      "visually-verified"                                     # فرع بلا نافذة ⇒ needs-owner
FILES=ios-native/Data/quran/pages.json;  t 1 n3/mushaf-perf "visually-verified"      # بيانات القرآن ⇒ needs-owner
FILES=artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Resources/QPC/p1.ttf; t 1 n3/mushaf-perf "visually-verified"  # خط QPC ⇒ needs-owner
FILES=$(printf '%s\n%s' "$M" "ios-native/Data/quran/ayat.json"); t 1 n3/mushaf-perf "visually-verified"  # خلط واجهة وبيانات ⇒ needs-owner
echo "owner-verified tests OK"
