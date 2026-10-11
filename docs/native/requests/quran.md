# طلبات قسم «القرآن» (ن3 ← ن1/ن4)

## إلى ن4 — الربط (PR الدفعة الأولى)
- في نقطة الدخول: `QuranSection.register(in: registry)` بعد `GeneratedScreens.registerAll`.
- المعرّفات المسجَّلة: `quran-hub`، `quran.surahs`، `quran.revelation-order`، `quran.makki-madani` (المسار بلا الشرطة الأولى و`/`→`.`).
- التصدير: `node scripts/native/export-ios-data.mjs` يكتب الآن `Data/quran/surahs-meta.json` (`quran.mjs`) بجانب `Data/mushaf` و`Data/quran/surah-NNN.json` الموجودة.
- الشاشات تفتح `MushafReaderView(startPage:)` على صفحة السورة؛ لا تعدّل نص المصحف ولا الخطوط.

## إلى ن1 — بيانات ناقصة (تبقى «قيد التوثيق» حتى تصل)
| المسار | الناقص |
|---|---|
| `/tafsir` | ملفات `tafsir/muyassar` و`tafsir/saadi` موجودة في الويب؛ المطلوب قرار المالك بتضمينها (≈8.6MB) أو تحميلها عن بُعد، وإظهار المصدر/الإذن من `tafsir-registry.json` |
| `/quran-hub/tajweed`، `qiraat`، `seven-ahruf`، `terms`، `numbers` | لا مصدر موثّق مُصدَّر في المستودع بشكل جاهز للتصدير؛ يلزم ملف JSON معتمد بمصدره وترخيصه |
| `/quran/surah-stories` | لا مصدر موثّق بالشكل المطلوب |
| `/quran/people` | `quran-people/people.json` موجود؛ يلزم تأكيد حالة المراجعة (review_status) قبل التصدير |
| `/hifz-path*`، `/memorization`، `/quran-memorization`، `/quran/memorization-plans` | يحتاج تصدير خطة الحفظ من `lib/memorization-path` بعد مراجعة |
| `/mutashabihat` | `quran/mutashabihat-index.json` موجود؛ يلزم تصدير بعد مراجعة المصدر |
| `/miracles`، `/ulum-quran`، `/quran-knowledge` | مصدرها بذور/Supabase؛ يلزم حالة اعتماد |
