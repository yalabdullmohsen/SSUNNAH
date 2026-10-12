# ن2 → ن1: نصوص مضمَّنة في مكوّنات الموقع (دفعة 2)
الصيغة المطلوبة: `{source_origin:"site-embedded", review_status:"pending-owner-review", sections/items:{...}}` كالدفعة السابقة، تُصدَّر إلى `ios-native/Data/<section>/`.
مسارات الشاشات في التطبيق قائمة وتعرض «قيد التوثيق» حتى تصل الملفات؛ سأربطها فور وجودها.

| مسار الشاشة | ملف الموقع (artifacts/majalis/src) | المطلوب تصديره | الملف المقترح |
|---|---|---|---|
| /duas-quran | pages/quran/ui/DuasQuranView.tsx | `DUAS` + `CATEGORIES` | Data/adhkar/duas-quran.json |
| /sunan-yawmiyya | views/SunanYawmiyyaPage.tsx | `SUNAN` + `CATEGORIES` | Data/adhkar/sunan-yawmiyya.json |
| /adhan-help | pages/worship/ui/AdhanHelpView.tsx | `SECTIONS` {id,title,body} | Data/adhkar/adhan-help.json |
| /dalail-nubuwwah | lib/dalail-nubuwwah-data.ts | `DALAIL_NUBUWWAH` | Data/sirah/dalail-nubuwwah.json |
| /sunnah-studies | lib/sunnah-studies-data.ts | `SUNNAH_STUDIES` | Data/hadith/sunnah-studies.json |
| /hadith-science | pages/hadith/ui/HadithScienceView.tsx | `CATEGORIES` + `TERMS` (سطر 30–32) | Data/hadith/hadith-science.json |
| /hadith/arbaeen-love-of-allah | lib/arbaeen-love-of-allah-service (جدول Supabase `arbaeen_love_of_allah`) | الصفوف المنشورة فقط (يحتاج مصدّرًا) | Data/hadith/arbaeen-love-of-allah.json |

ملاحظة: /daily-wird بُنيت أصليًا (تتبّع محلي بلا نص). /hadith/books-and-rulings مركز تنقّل بلا نص في الموقع نفسه، سُجّلت في data-exemptions.json.
