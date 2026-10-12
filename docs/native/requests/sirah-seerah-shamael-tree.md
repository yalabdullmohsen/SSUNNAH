# طلب إلى ن2 (أو ن3 إن كان أقل حملًا): /seerah و/shamael و/prophets/tree

**الخلاصة:** للموقع بيانات فعلية للمسارات الثلاثة (مضمَّنة في الواجهة لا API). قرار المالك: لا شيء مؤجَّل، وكل الـ212 أصلية بمحتوى الموقع. التصدير الفارغ السابق في `sirah.mjs` لم يكن قرار المالك وصُحّحت عبارته.

| المسار | مصدر الموقع | الشكل |
|---|---|---|
| `/seerah` | `src/views/SeerahPage.tsx`: `PHASES` (عنوان، سنة، `desc`، `topics`، `keyEvents`) و`SOURCES` | مراحل السيرة؛ الملف المحزوم `Data/sirah/seerah-phases.json` |
| `/shamael` | `src/views/ShimaelPage.tsx`: `ABWAB_KHALQ` وأخواتها (`ShamilBab`: أحاديث `{text, rawi, source}`) | أبواب الشمائل؛ `Data/sirah/shamail.json` |
| `/prophets/tree` | `src/lib/prophets-lineage.ts`: `PROPHETS_LINEAGE` (شجرة `LineageNode`، مصدرها ابن كثير وابن الأثير) | جذر واحد؛ `Data/sirah/prophets-lineage.json` ليقرأه `File.lineage` |

## المطلوب
1. إضافة التصدير في `scripts/native/sections/sirah.mjs` (يُستخرج بـ`loadConsts` كما يُفعل مع `SAHABAH`) بلا تعديل نصوص الأحاديث والآثار ولا اختراع درجات؛ ما لا درجة له يبقى بمصدره كما في الموقع.
2. شاشة القراءة موجودة (`SirahSection.inline` + `SirahAdapters.seerah/shamail/lineage`)؛ تُراجَع المحوّلات على الشكل الفعلي.
3. تُحذف أسطر `reject(...قرار المالك...)` لهذه الثلاثة، ويُضاف مسار `/seerah` و`/shamael` و`/prophets/tree` إلى لقطات التحقق.
4. أي شك في محتوى ديني يُوثَّق للمراجعة البشرية ولا يُحذف.
