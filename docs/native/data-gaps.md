# فجوات بيانات التطبيق الأصلي

المصدر: `node scripts/native-data-check.mjs` (يقرأ `docs/native/data-exemptions.json`).

الحالة (2026-10-12): مفقود 0 · تالف 0 · فارغ غير مستثنى 0.
- المفقودة التسعة (islamic-landmarks-map، occasions، occasions-lessons، prophets، prophets-tree، seerah، shamael، tarikh-islami، teachers) مراجع ميتة في `Generated/SirahScreens.swift` تحلّ محلها `SirahSection.register` بملفات مُصدَّرة أخرى؛ مسجَّلة في `overriddenGenerated`.
- الفارغة مستثناة بدليل في `computedInApp` / `intentionallyEmpty`.
- المراجع الميتة التسعة لم تعد في `Generated/SirahScreens.swift`: المولّد يتخطى ما في `overriddenGenerated`.

## نصوص مضمَّنة تُراجَع بعد الإطلاق
تُمرَّر حرفيًا من كود الموقع بلا أي تعديل في النص أو الشروح (قرار المالك 2026-10-12). كل سجل فيه `source_origin="site-embedded"` و`review_status="pending-owner-review"`؛ حقل `source` الأصلي لم يُمسّ.
- `hadith/arbaeen-nawawi.json` (الأربعون النووية)
- `adhkar/duas.json` (الأدعية)
- `hadith/wasaya-nabawiyya.json` (الوصايا النبوية)
- `sirah/prophets-lineage.json` (شجرة نسب الأنبياء؛ المصدر في رأس `prophets-lineage.ts`: البداية والنهاية، الكامل)
- `fiqh/embedded/{tahara,sawm,hajj,janaza,salah-guide,mawarith}.json` و`aqidah/embedded/tawhid.json`: ثوابت الصفحات حرفيًا (`sections`)؛ الوسمان في رأس كل ملف.
- `adhkar/{duas-quran,sunan-yawmiyya,adhan-help}.json` و`hadith/{hadith-science,sunnah-studies}.json` و`sirah/dalail-nubuwwah.json`: ثوابت الموقع حرفيًا؛ الوسمان في رأس الملف.
- `hadith/arbaeen-love-of-allah.json`: لم يُصدَّر؛ صفوفه المنشورة في جدول Supabase `arbaeen_love_of_allah` (RLS: published فقط) لا في الكود، والمُصدِّر بلا وصول لقاعدة البيانات. يحتاج قراءة للمنشور فعليًا بإذن المالك؛ لا يُؤخذ من ملف الـmigration (قد يخالف الحالة الحيّة). ملاحظة: الجدول فيه عمود `review_status` خاص به فيُسمّى الوسم هناك `review_flag`.
- `adhkar/daily-wird.json`: لم يُصدَّر؛ الصفحة متتبّع تقدّم بلا قائمة محتوى (ثابتات رسائل المداومة فقط).
