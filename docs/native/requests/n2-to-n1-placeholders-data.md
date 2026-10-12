# ن2 → ن1: بيانات مطلوبة لإزالة «قيد التوثيق» من مسارات الإطلاق

الشاشات جاهزة للتوصيل فور وصول الملف (ContentPendingView اليوم). المصدر على الموقع هو المرجع؛ لا محتوى يُولَّد.

| المسار | مصدر الموقع | الملف المطلوب (ios-native/Data) |
|---|---|---|
| `/arbaeen-nawawi` و`/arbaeen-nawawi/:id` | `src/lib/arbaeen-nawawi-seed.ts` (`ARBAEEN_NAWAWI`: id,title,text,explanation,benefits,source) | `hadith/arbaeen-nawawi.json` |
| `/duas` (+`/duas-quran`) | `pages/worship/ui/DuasView.tsx` (`CATEGORIES`, `DUAS`) | `adhkar/duas.json` |
| `/daily-wird` | `pages/worship/ui/DailyWirdView.tsx` | `adhkar/daily-wird.json` |
| `/wasaya-nabawiyya` | صفحة `WasayaNabawiyyaPage` | `hadith/wasaya-nabawiyya.json` |

ملاحظات: أبقِ `review_status` وحقل المصدر لكل عنصر (حقيقة شرعية: مصدر موثّق). إن كان بعضها داخل مكوّن لا ملف، فالمطلوب مُصدِّر في `scripts/export-ios-data`.
مبنية بلا بيانات: `/adhan-settings` (شاشة الإشعارات الأصلية)، `/knowledge/:section` (8 أقسام مصدَّرة؛ المجهول «غير موجود»)، `/c/:slug` (إحالة تُجلب من الخادم → حالة مرتبة).
