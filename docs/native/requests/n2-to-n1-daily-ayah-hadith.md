# ن2 → ن1: تصدير آية اليوم وحديث اليوم (قرار المالك: مطابقة الرئيسية للموقع)

الواجهة جاهزة في التطبيق وتبقى **مخفية حتى يصل التصدير**؛ لا نص يُعرض قبله.

## المطلوب (من `artifacts/majalis/src/lib/daily-content.ts` حرفيًا، بلا أي تعديل في النصوص أو المراجع)
1. `Data/home/daily-ayah.json`: مصفوفة `DAILY_AYAH_POOL` بترتيبها كما هي: `id, surah, ayahNumber, reference, meaning` (نص الآية يؤخذ في التطبيق من بيانات المصحف نفسها؛ يجوز تضمين `text` كما هو للمطابقة فقط).
2. `Data/home/daily-hadith.json`: مصفوفة الحديث **بعد** `filterForPublicZone(DAILY_HADITH_POOL, "dailyReminder")` بترتيبها، وإن كانت فارغة فالمجموعة كاملة (نفس احتياط `getDailyHadith`): `id, text, narrator, source, grade, meaning`، مع أي حقل رقم/مرجع للحديث إن وُجد في السجل (`number`)؛ وإن لم يوجد في الموقع فلا يُختلق.
3. لكل سجل في الملفين `review_status` و`source_origin` كالمعتاد. التطبيق يتجاهل أي سجل بلا الحقلين (الملف القديم غير المطابق للعقد `daily-ayah.json` لا يُعرض).
4. خوارزمية الاختيار حرفيًا في `Data/home/daily-algorithm.json`: `{ "timeZone": "Asia/Kuwait", "index": "floor(Date.UTC(y,m-1,d)/86400000) % pool.length" }` حيث (y,m,d) تاريخ الكويت كما في `getDayIndex`.

## التحقق الذهبي (إلزامي)
`Tests/SunnahNativeTests/Fixtures/daily/golden.json` يولَّده سكربت يستدعي `getDailyAyah(date)` و`getDailyHadith(date)` من الموقع لـ**10 تواريخ على الأقل** (منها حدّ منتصف ليل الكويت: `…T20:59:59Z` و`…T21:00:00Z`، وتاريخ يلتفّ فيه الفهرس على طول المجموعة): `[{ "iso": "...", "ayahId": "...", "hadithId": "..." }]`.
اختبار Swift `DailyPickTests` يقارن اختيار كل تاريخ بالمعرّفات؛ يفشل البناء عند أي اختلاف.
