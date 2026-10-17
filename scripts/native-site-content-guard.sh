#!/usr/bin/env bash
# حارس محتوى docs/site (بلا اتصال): مسارات الخصوصية موحّدة «الإعدادات ← مركز الخصوصية»، زر الإبلاغ بصيغة عامة بلا قائمة صفحات،
# سؤال التصدير موجود بالعربية والإنجليزية، ولا ادعاء مراجعة شيخ. SITE=<مجلد> للاختبار.
set -uo pipefail
cd "$(dirname "$0")/.."; S=${SITE:-docs/site}; bad=0
f() { echo "✗ $1"; bad=1; }
for p in support.html privacy.html; do
  grep -q 'الحساب ← مركز الخصوصية\|Account → Privacy Center' "$S/$p" && f "$p: مسار قديم «الحساب ← مركز الخصوصية» (الصحيح: الإعدادات)"
  grep -q 'الإعدادات ← مركز الخصوصية' "$S/$p" || f "$p: بلا مسار «الإعدادات ← مركز الخصوصية»"
done
grep -q '(المكتبة والسيرة والعقيدة والأحاديث)\|(library, sirah, aqidah, hadith)' "$S/support.html" && f "support.html: قائمة صفحات لزر الإبلاغ (استعمل الصيغة العامة)"
grep -q 'كل صفحة محتوى' "$S/support.html" || f "support.html: بلا صيغة «كل صفحة محتوى» لزر الإبلاغ"
grep -q 'Export account data' "$S/support.html" && grep -q 'تصدير بيانات الحساب' "$S/support.html" || f "support.html: سؤال تصدير البيانات ناقص (ar/en)"
grep -qE 'راجعه|مراجعة الشيخ|reviewed by (Sheikh|Shaykh)' "$S/privacy.html" "$S/support.html" && f "ادّعاء مراجعة شيخ"
[ $bad = 0 ] && echo "✓ محتوى docs/site سليم"; exit $bad
