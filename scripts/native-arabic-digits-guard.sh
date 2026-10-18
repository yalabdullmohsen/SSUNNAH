#!/usr/bin/env bash
# يمنع الأرقام اللاتينية في نصوص واجهة المصحف ومراحل القصة: أي Text/accessibilityLabel
# يحوي \( ... ) يجب أن يمرّ كل استيفاء فيه بـ .arabicDigits / ArabicNumerals / Self.arabicDigits
# أو أن يكون السطر موسومًا بـ `// digits-ok` (مفاتيح بحث/مسارات لا نصًا معروضًا).
set -euo pipefail
cd "$(dirname "$0")/.."
SN=artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative
FILES=$(ls $SN/Mushaf/*.swift $SN/Components/SunnahStepper.swift $SN/Templates/ExplainerTemplate.swift; find $SN/Sections $SN/Special -name "*.swift")
BAD=$(grep -nE '(Text|Label|accessibilityLabel|navigationTitle)\(.*"[^"]*\\\([^)]*\)' $FILES \
  | grep -vE 'arabicDigits|ArabicNumerals|digits-ok' \
  | grep -E '\\\((.*\.(id|page|firstPage|number|order|v|ayah|count)|index \+ 1|i \+ 1|current|p|\$0)\)' || true)
if [ -n "$BAD" ]; then echo "أرقام لاتينية في نص واجهة (استخدم .arabicDigits):"; echo "$BAD"; exit 1; fi
echo "arabic-digits-guard: OK"
