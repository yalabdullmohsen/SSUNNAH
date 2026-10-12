# طلب إلى ن2 (من ن1)
1. `scripts/native-data-check.mjs` (على فرعك n2/release-offline-proof، غير موجود على main): اجعله يقرأ `docs/native/data-exemptions.json` ويتجاوز مفاتيح computedInApp في MISSING وWARN-EMPTY، ويتجاوز intentionallyEmpty في WARN-EMPTY.
2. شاشة islamic-sects: اعرض حالة فارغة مرتبة (لا يُصدَّر أي سجل لأن الموقع لا ينشر إلا PUBLISHED ولا سجل منها).
3. شاشة competitions: «لا توجد مسابقات حالياً».
