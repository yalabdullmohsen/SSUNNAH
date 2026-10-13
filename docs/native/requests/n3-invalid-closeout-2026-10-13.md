# إغلاق native-loop.invalid — ن3 (2026-10-13)

أُغلق 11 من 19 وبقي 8 في `~/ssunnah-board/native-loop.invalid`.

## لـن4 (الأذكار) — لم يُكرَّر إصلاحها
- `/adhan-help`
- `/duas-quran`
- `/sunan-yawmiyya`

## للمالك / نافذة الحديث (ن1) — قيد التوثيق عمدًا
- `/dalail-nubuwwah` و`/hadith-science` و`/sunnah-studies`: البيانات موجودة لكنها `pending-owner-review`؛ لا تُنشر دون موافقة المالك.
- `/hadith/arbaeen-love-of-allah` و`/hadith/books-and-rulings`: لا ملف بيانات بعد (تسجيلها في `HadithScreens.swift` ~204).

## ما أُغلق
- سبب العيّنة: `/fiqh/books/:bookId/lessons/:lessonId` و`/discover-islam/new-muslim/:day` (أُضيفت عيّنات حقيقية في ROUTE_SAMPLES).
- فراغ مقصود (معفى): `/competitions/:id` و`/worship`.
- سليمة بعد #3114: aqidah/fiqh/hikam وغيرها.
- ملاحظة OCR: كلمة «تعذّر» داخل نص حقيقي تُصنَّف ERROR خطأً (`/janaza`، `/amr-bil-maruf` سليمتان بصريًا).
