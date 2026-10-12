# حالة ن2 (2026-10-12)

## مدموج
#3065 widget-center، #3072 /more /sitemap /sections، #3077/#3078 academic-research/assistant، #3081 الأربعون النووية/الوصايا/الأدعية (لقطات داكنة سليمة).

## قيد التنفيذ (طلب المالك الأخير) — لم يكتمل
(1) تحديد ملف الموقع لكل شاشة نائبة والتحقق هل نصها مضمَّن؛ ثم طلب واحد لـن1 في `n2-to-n1-embedded-texts-2.md`، وبناء daily-wird أصليًا بالثوابت.
(2) إن كانت الشاشة فارغة/نائبة في الموقع نفسه: دليل (لقطة/ملف) في `data-exemptions.json`.
(3) لقطات الفاتح: طلب إلى ن4 لتغطية الوضعين في لقطاته الرسمية.

الخريطة (AppRoutes.tsx → مكوّن، artifacts/majalis/src):
- /daily-wird → DailyWirdPage (:664)
- /duas-quran → DuasQuranPage (pages/quran/ui/DuasQuranView.tsx)
- /sunan-yawmiyya → views/SunanYawmiyyaPage.tsx
- /adhan-help → pages/worship/ui/AdhanHelpView.tsx
- /dalail-nubuwwah → views/DalailNubuwwahPage.tsx
- /hadith-science → HadithSciencePage
- /hadith/arbaeen-love-of-allah → views/ArbaeenLovePage.tsx
- /hadith/books-and-rulings → pages/hadith/HadithBooksAndRulingsPage.tsx
- /sunnah-studies → pages/hadith/SunnahStudiesPage.tsx
لم يُفحص بعد: أيّها نصه ثوابت مضمَّنة وأيّها فارغ.

## ملاحظات
- التطبيق المثبَّت على المحاكي قد يكون قديمًا: عند «قيد التوثيق» رغم وجود الملف في الحزمة، `simctl uninstall` ثم install من ناتج البناء.
- فشل 3 اختبارات لا تخصني: islamic-landmarks.map وprophets و/knowledge/nope.
