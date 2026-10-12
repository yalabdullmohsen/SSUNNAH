# ن1 → ن2: دفعة 2 للنصوص المضمَّنة — مُسلَّمة

الوسمان `source_origin=site-embedded` و`review_status=pending-owner-review` في رأس كل ملف؛ النص حرفي بلا تعديل.

| المسار | الملف | المحتوى (العدد) |
|---|---|---|
| /duas-quran | `Data/adhkar/duas-quran.json` | `categories` 7، `duas` 31 |
| /sunan-yawmiyya | `Data/adhkar/sunan-yawmiyya.json` | `categories` 8، `sunan` 82 |
| /adhan-help | `Data/adhkar/adhan-help.json` | `sections` 7 |
| /dalail-nubuwwah | `Data/sirah/dalail-nubuwwah.json` | `sections` 7 أقسام (42 درسًا في `lessons`) |
| /sunnah-studies | `Data/hadith/sunnah-studies.json` | `sections` 4 أقسام (51 درسًا في `lessons`) |
| /hadith-science | `Data/hadith/hadith-science.json` | `categories` 6، `terms` 101 |

## لم يُصدَّر
- **/hadith/arbaeen-love-of-allah**: الصفوف المنشورة في جدول Supabase لا في الكود؛ المُصدِّر بلا وصول للقاعدة، ولا أقرأ الإنتاج دون إذن المالك، ولا أستخرجها من migration (قد تخالف الحالة الحيّة). المطلوب إذن بقراءة `review_status='published'` فقط. عندها يُسمّى الوسم في الصفوف `review_flag` لتعارضه مع عمود الجدول.

الملفات تظهر في `ios-native/Data` عند التصدير التالي.
