# إغلاق native-loop.invalid — ن3 (2026-10-13)

أُغلقت الثمانية المتبقية؛ `native-loop.invalid` فارغ.

## الأذكار (مطابقة الموقع حرفيًا، دون لمس ملفات ن4)
- `/adhan-help` و`/duas-quran` و`/sunan-yawmiyya`: تسجيل لاحق في `Special/SiteContentScreens.swift` يتجاوز عنصر الحجز في `AdhkarExtraScreens.swift`.

## الحديث (حسب قرار المالك 2026-10-13)
- `/dalail-nubuwwah` و`/hadith-science` و`/sunnah-studies`: تُعرض كالموقع من البيانات المصدَّرة (`pending-owner-review`, `site-embedded`).
- `/hadith/arbaeen-love-of-allah`: العنوان والمقدمة + الحالة الفارغة الرسمية «لا يتوفر محتوى هنا الآن.» (الموقع لا يعرض للزائر شيئًا غير ذلك؛ لا جلب من الإنتاج).
- `/hadith/books-and-rulings`: شاشة أصلية بتنقّل ثابت مطابقة لـHadithBooksAndRulingsPage.

## ما أُغلق
- سبب العيّنة: `/fiqh/books/:bookId/lessons/:lessonId` و`/discover-islam/new-muslim/:day` (أُضيفت عيّنات حقيقية في ROUTE_SAMPLES).
- فراغ مقصود (معفى): `/competitions/:id` و`/worship`.
- سليمة بعد #3114: aqidah/fiqh/hikam وغيرها.
- ملاحظة OCR: كلمة «تعذّر» داخل نص حقيقي تُصنَّف ERROR خطأً (`/janaza`، `/amr-bil-maruf` سليمتان بصريًا).
