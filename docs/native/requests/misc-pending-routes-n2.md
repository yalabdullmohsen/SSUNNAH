# طلب إلى ن2 — سبعة مسارات غير محلولة

نفس شروط الالتقاط (بناء حديث 2026-10-12). `/knowledge/:section` حُلّ بإضافة عيّنة صحيحة (`/knowledge/intro-islam`) وخرج من القائمة.

| المسار | السبب | ما يلزم |
|---|---|---|
| `/c/:slug` | **لا بيانات ثابتة**: استشهادات المستخدمين تُجلب من Supabase بالـslug (`CitationPublicPage` → `fetchCitationBySlug`)؛ لا عيّنة ممكنة ولا resolver | قرار: جلب حي عبر العميل الأصلي، أو إدراجه في `data-exemptions.json` بسبب موثَّق |
| `/arbaeen-nawawi/:id` | **لا بيانات مصدَّرة + لا resolver**: `HadithScreens.swift` ~202 يسجّله `ContentPendingView`؛ النص مضمّن في صفحة الويب (`ArbaeenHadithDetailPage`) | تصدير الأربعين (42) إلى `Data/hadith/` ثم شاشة تفصيل؛ العيّنة `/arbaeen-nawawi/1` جاهزة |
| `/wasaya-nabawiyya` | **لا بيانات مصدَّرة**: مسجَّل `ContentPendingView` (HadithScreens ~204)، محتواه مضمّن في صفحة ويب | تصدير ثم شاشة |
| `/adhan-settings` | **شاشة موجودة لكنها غير موصولة**: `AccountNotificationSettingsScreen` موجود، والمسار مسجَّل `ContentPendingView` في `AdhkarExtraScreens.swift` | وصل المسار بالشاشة الأصلية (أو إحالة صريحة كـ`/widget-center` ← موثَّقة في exemptions) |
| `/daily-wird` | **ثغرة موثَّقة**: الأذكار كلها `needs_review` ⇒ لا مصدر موثَّق؛ لا نختلق أذكارًا | مصدر موثَّق من المالك/المراجعة البشرية |
| `/duas` | نفس السبب أعلاه | نفسه |

بوابة الإطلاق: لا Release يمر وفي البناء مسار يعرض الاحتياط، فكل بند هنا إما شاشة أو إدراج موثَّق في `data-exemptions.json`.
