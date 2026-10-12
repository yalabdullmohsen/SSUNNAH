# عقد البيانات — التطبيق الأصلي (SwiftUI)

يصف البيانات **كما هي** (لا إعادة تصميم). المصدر: `artifacts/majalis/public/data/*` و`api/` وSupabase (`ngmvmlulzacrlicuagyp`). الأحجام تقريبية (2026-10-11).
التحزيم يتم بسكربت واحد: `node artifacts/majalis/scripts/native/export-ios-data.mjs [--adhkar-json f] [--check]` → `ios-native/Data/` + `MANIFEST.json` (sha256 وحجم لكل ملف + عدّادات + المرفوض). يرفض: المحجوز في `content/content-hold.json`، النص الفارغ، الحديث غير الصحيح (ضعيف/موضوع/بلا درجة)، أسئلة demo/بلا شرح/بلا مرجع، الأذكار غير `verified`. `Data/` غير مُلتزَم (يُولَّد على الماك).
**محمي (لا يُعدَّل):** نص القرآن/ترقيمه/الصفحات الـ604، حساب المواقيت. القرآن من Tanzil فقط. ترقيم مسلم المحلي `n` تسلسلي: لا يُستشهد به.

## الفهرس
العقد مقسّم إلى ملفات صغيرة لكل قسم في `docs/native/contract/` (تعديل قسمك في ملفه فقط؛ لا تكتب في هذا الفهرس إلا عند إضافة ملف). **أقسام التصدير (`scripts/native/sections/*.mjs`):** كل قسم ملف مستقل يُحمَّل تلقائيًا قبل كتابة المنافيست (`export-ios-data.mjs` يشغَّل عبر `node --import tsx`). الإخراج في `ios-native/Data/<قسم>/<اسم>.json` بالأسماء التي يتوقعها كود SunnahNative.

- [6) أقسام التصدير](contract/sections.md)
- [1) مُحزَّم داخل التطبيق](contract/bundled.md)
- [2) يُجلب من الشبكة](contract/network.md)
- [3) واجهات api/](contract/api.md)
- [4) جداول Supabase ذات الصلة](contract/supabase.md)
- [5) قواعد القبول (يفرضها السكربت)](contract/acceptance.md)
- [قسم aqidah](contract/aqidah.md)
- [قسم fiqh](contract/fiqh.md)
- [قسم sirah](contract/sirah.md)
- [قسم learn + audio](contract/learn-audio.md)
- [قسم quran (التلاوة/الحلقات/مركز العبادة)](contract/quran.md)
- [قسم library](contract/library.md)
- [قسم adhkar](contract/adhkar.md)
- [محسوب داخل التطبيق / فارغ مقصود](contract/exemptions.md)
- [تدقيق التطابق (موقع ↔ تطبيق)](contract/parity.md)
