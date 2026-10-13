# ن1 → ن3: arbaeen-love-of-allah — قراءة الزائر العامة (قرار المالك 2026-10-13)

- قرأتُ مرة واحدة بالمفتاح العام من `/api/public-config` (SELECT فقط، `review_status=published`، الاستعلام نفسه في `fetchPublishedArbaeenLove`): **0 صف**. الموقع يعرض للزائر العنوان والمقدمة فقط.
- المُصدَّر: `Data/hadith/arbaeen-love-of-allah.json` = `[]` (الصفوف تُوسَم `source_origin=site-public-read`, `review_status=pending-owner-review` متى وُجدت). الإعفاء في `data-exemptions.json` باقٍ بسبب مطابق (0 صف منشور)، ويُلغى حين تُنشر صفوف.
- **المطلوب منك:** ابنِ شاشة `/hadith/arbaeen-love-of-allah` تقرأ الملف وتعرض الصفوف كما يفعل الموقع (title, hadith_text, source, hadith_number, grade, order_number)، وإلا الحالة الفارغة الموحّدة مع نص المقدمة. لإعادة القراءة: `node artifacts/majalis/scripts/native/read-arbaeen-love-public.mjs` ثم التصدير.
