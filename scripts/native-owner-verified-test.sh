#!/usr/bin/env bash
# يثبت: needs-owner لا يُضاف إلا عند غياب (وسم visually-verified + ملكية النافذة لكل الملفات المحمية)
cd "$(dirname "$0")/.." || exit 2
M=artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Mushaf/MushafView.swift
t() { exp=$1; shift; printf '%s\n' "$FILES" | node scripts/native-owner-verified.mjs "$@" >/dev/null 2>&1; rc=$?; [ $rc = "$exp" ] || { echo "✗ $* (توقّعت $exp وجاء $rc)"; exit 1; }; }
FILES=$M;  t 0 n3/mushaf-perf "native-section,visually-verified"   # مالك المسار + الوسم ⇒ إعفاء
FILES=$M;  t 1 n3/mushaf-perf "native-section"                     # بلا الوسم ⇒ needs-owner
FILES=$M;  t 0 n1/design      "visually-verified"                  # مسار مملوك لنافذة أخرى + الوسم ⇒ إعفاء (قرار المالك)
FILES=artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/QuranTextGuardTests.swift; t 0 n1/design-prophets "visually-verified"  # اختبار القرآن مملوك لـn3
FILES=$M;  t 1 feature/x      "visually-verified"                  # فرع بلا نافذة ⇒ needs-owner
FILES=$(printf '%s\n%s' "$M" "scripts/other.sh"); t 1 n3/mushaf-perf "visually-verified"  # ملف بلا مالك ⇒ needs-owner
FILES=""; t 1 n3/mushaf-perf "visually-verified"                   # لا ملفات ⇒ لا إعفاء
echo "owner-verified tests OK"
