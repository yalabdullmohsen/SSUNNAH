#!/usr/bin/env bash
# يمنع الأرقام اللاتينية في نصوص واجهة المصحف ومراحل القصة: أي Text/accessibilityLabel
# يحوي \( ... ) يجب أن يمرّ كل استيفاء فيه بـ .arabicDigits / ArabicNumerals / Self.arabicDigits
# أو أن يكون السطر موسومًا بـ `// digits-ok` (مفاتيح بحث/مسارات لا نصًا معروضًا).
set -euo pipefail
cd "$(dirname "$0")/.."
SN=artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative
FILES=$(find $SN -name "*.swift")
BAD=$(grep -nE '(Text|Label|accessibilityLabel|navigationTitle)\(.*"[^"]*\\\([^)]*\)' $FILES \
  | grep -vE 'arabicDigits|ArabicNumerals|digits-ok' \
  | grep -E '\\\((.*\.(id|page|firstPage|number|order|v|ayah|count)|index \+ 1|i \+ 1|current|p|\$0)\)' || true)
if [ -n "$BAD" ]; then echo "أرقام لاتينية في نص واجهة (استخدم .arabicDigits):"; echo "$BAD"; exit 1; fi
# المكوّنات المشتركة تحوّل أي نص String إلى أرقام عربية عند العرض (الجذر)، فلا تبقى أرقام لاتينية في شاشة تستعملها.
for f in Components/SunnahChip Components/SunnahListRow Components/StateViews Components/SunnahArabicText Components/SunnahModel2 Templates/DetailTemplate Sections/learn/LearnSupport; do
  grep -q 'arabicDigits' "$SN/$f.swift" || { echo "مكوّن مشترك لا يحوّل الأرقام: $f"; exit 1; }
done
# الودجت: مصدر العنصر يُعرض دائمًا عبر WidgetFormat.arabicDigits («صحيح مسلم: ٧٢٠»).
W=artifacts/majalis/ios/App/PrayerWidget/SunnahLocalDataWidgets.swift
if grep -nE 'Text\(item\.source\)' "$W"; then echo "مصدر ودجت بأرقام لاتينية (استخدم WidgetFormat.arabicDigits): $W"; exit 1; fi
grep -q 'WidgetFormat.arabicDigits(item.source)' "$W" || { echo "ودجت المصدر لا يمرّ بـ WidgetFormat.arabicDigits: $W"; exit 1; }
echo "arabic-digits-guard: OK"
