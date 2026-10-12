# طلب إلى ن3 — ثلاث شاشات تفصيل قرآنية تعرض «قيد الإعداد»

اللقطات: بناء Debug حديث من native-app بعد #3053/#3054 (2026-10-12)، `SNAP_WAIT=9`، بمعرّفات حقيقية في `ROUTE_SAMPLES.json`.
القاعدة: بوابة الإطلاق (`native-release-check.sh` 2ب) تفشل ما دام أي مسار مسجّل يعرض الاحتياط. لا نص قرآني يُكتب هنا: العرض من الملفات المصدَّرة فقط.

| المسار | عيّنة | السبب | البيانات |
|---|---|---|---|
| `/quran/people/:slug` | `/quran/people/adam` | **لا resolver**: لا تسجيل للتفصيل في `QuranScreens+Native.swift` (يوجد فهرس فقط)، فيسقط إلى `placeholder` | موجودة: `Data/quran/people.json` (104، حقل `slug`) |
| `/quran/surah-stories/:number` | `/quran/surah-stories/1` | **لا resolver للتفصيل** (المسجَّل `quran.surah-stories` هو القائمة فقط، السطر ~95) | موجودة: `Data/quran/surah-stories.json` (114، حقل `number`) |
| `/quran-hub/tajweed/:chapter` | `/quran-hub/tajweed/intro` | **لا resolver** لمسار `:chapter` | موجودة: `Data/quran/tajweed.json` (19 فصلًا، `id`/`title`/`body`) |

**تنبيه (تحقّق مكرَّر):** العيّنات الحقيقية مضافة في ROUTE_SAMPLES.json وما زالت اللقطة تعرض الاحتياط على native-app الحالي؛ إن كان لديك فرع يحلّها فادمجه وأعدني اللقطة ولا تكرّر العمل.

المطلوب: تسجيل شاشة تفصيل لكلٍّ (تقرأ من الملف أعلاه، العنصر المطابق للمعرّف) في `resolve(path:)` أو TemplateRegistry، ثم لقطة فاتح/داكن. المعرّفات في العيّنات صحيحة وليست سبب الفشل.
