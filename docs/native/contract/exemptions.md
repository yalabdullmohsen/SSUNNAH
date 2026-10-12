## محسوب داخل التطبيق / فارغ مقصود (قرار المالك)
- `fiqh/worship.json` و`fiqh/mawarith-calculator.json` و`fiqh/prayer-times.json`: **محسوبة داخل التطبيق** — لا ملف بيانات مطلوب (تبقى `[]` وتُستثنى من قائمة الناقص في native-data-check). المواقيت مطابقة لمخرجات الموقع حرفيًا ولا تُمسّ.
- `learn/competitions.json`: `[]` مقصود (المنشور 0)؛ التطبيق يعرض «لا توجد مسابقات حالياً».
- `aqidah/islamic-sects.json`: `[]`. الموقع لا يعرض إلا PUBLISHED ولا سجل منها، فلا يُصدَّر نص أي سجل. المُخفاة (35): NEEDS_SOURCE 13 (بلا مصدر)، NEEDS_HISTORICAL_REVIEW 15 (مراجعة تاريخية)، NEEDS_SHARIA_REVIEW 6 (مراجعة شرعية)، CONFLICTING_SOURCES 1 (مصادر متعارضة). تُصدَّر بعلامة «قيد المراجعة» عند نشر الموقع لها فقط.
- **الأسئلة بلا مرجع:** تُصدَّر كما يعرضها الموقع (`documentation_status=unsourced`): 583 سؤالًا غير demo بلا مرجع؛ المحجوز في content-hold (94) يبقى محجوزًا.
- **قائمة الاستثناءات في ملف واحد:** `docs/native/data-exemptions.json` (computedInApp / intentionallyEmpty). `native-data-check` يقرؤها فلا يعدّ هذه الملفات مفقودة ولا فارغة. شاشة islamic-sects تعرض حالة فارغة مرتبة.
