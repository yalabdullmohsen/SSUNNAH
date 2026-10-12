# ن1 → ن2: النصوص المضمَّنة — القائمة النهائية (10 صفحات)

الفحص قبل التصدير: المسار ← الشاشة الأصلية ← البيانات (الكود + PARITY_AUDIT + data-exemptions).

## صُدِّر حرفيًا (الوسمان `source_origin=site-embedded` و`review_status=pending-owner-review` في رأس الملف)
سبب التصدير: الشاشة الأصلية تقرأ `fiqh/<page>.json` المشتق من فصول `books.json` (قائمة عناوين)، ونص الصفحة نفسه ثوابت مضمَّنة لا تصل التطبيق.

| الصفحة | المسار | الملف الجديد | الأقسام |
|---|---|---|---|
| TaharaPage | `/tahara` | `Data/fiqh/embedded/tahara.json` | 9 |
| SawmPage | `/sawm` | `Data/fiqh/embedded/sawm.json` | 6 |
| HajjView | `/hajj` | `Data/fiqh/embedded/hajj.json` | 4 |
| JanazaView | `/janaza` | `Data/fiqh/embedded/janaza.json` | 6 |
| SalahGuideView | `/salah-guide` | `Data/fiqh/embedded/salah-guide.json` | 11 |
| MawarithView | `/mawarith` | `Data/fiqh/embedded/mawarith.json` | 6 (نصوص تعليمية؛ الحاسبة تبقى محلية) |
| TawhidPage | `/tawhid` | `Data/aqidah/embedded/tawhid.json` | 4 (أنواع التوحيد، أركان الإيمان، القواعد، كتب مقترحة) |

الشكل: `{ source_origin, review_status, sections: { <اسم الثابت في الكود>: [...] } }` — السجلات كما في الثوابت بلا تعديل. ربط الشاشات بها (حاليًا لا تقرؤها) على ن2/ن3.

## لا يحتاج تصديرًا
- **SinsAndRightsPage** `/sins-and-rights`: `fiqh/sins-and-rights.json` (32 موضوعًا + التصنيفات) مصدَّر من `lib/sins-rights-data` ومربوط بـFiqhSection.
- **QuranCirclesView** `/quran-circles`: `quran/circles.json` مصدَّر (المعتمد والنشط) والشاشة `TilawaCirclesScreens`.
- **IslamStatsPage** `/islam-stats`: شاشة أصلية كاملة `AccountIslamStatsScreen` بنصوص `AccountTexts` (محسوب/مضمَّن في التطبيق)؛ تبويب القرآن يُربط بـ`/quran-hub/numbers`.
- **المواريث (الحساب)**: تُحسب داخل التطبيق (`fiqh/mawarith-calculator` فارغ عمدًا في data-exemptions).
- **TawhidPage — أسماء الله** (`ASMA_HUSNA`) و**مواضيع التوحيد**: موجودة أصلًا في `aqidah/asma-husna.json` (91) و`aqidah/tawhid.json`؛ لم تُكرَّر. `AQEEDA_SECTIONS` بطاقات تنقّل لا محتوى.
