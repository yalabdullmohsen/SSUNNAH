# طلبات قسم «القرآن» (ن3 ← ن1/ن4)

## إلى ن4 — الربط (PR الدفعة الأولى)
- في نقطة الدخول: `QuranSection.register(in: registry)` بعد `GeneratedScreens.registerAll`.
- المعرّفات المسجَّلة: `quran-hub`، `quran.surahs`، `quran.revelation-order`، `quran.makki-madani` (المسار بلا الشرطة الأولى و`/`→`.`).
- التصدير: `node scripts/native/export-ios-data.mjs` يكتب الآن `Data/quran/surahs-meta.json` (`quran.mjs`) بجانب `Data/mushaf` و`Data/quran/surah-NNN.json` الموجودة.
- الشاشات تفتح `MushafReaderView(startPage:)` على صفحة السورة؛ لا تعدّل نص المصحف ولا الخطوط.

## إلى ن1 — بيانات ناقصة (تبقى «قيد التوثيق» حتى تصل)
| المسار | الناقص |
|---|---|
| `/quran-hub/tajweed`(+`:chapter`)، `qiraat`، `seven-ahruf`، `terms`، `numbers` | تجويد: `src/lib/quran-tajweed/chapters.ts` (كود، 38KB) يلزم تصدير JSON معتمد؛ الباقي لا مصدر موثّق مُصدَّر في المستودع بشكل جاهز للتصدير؛ يلزم ملف JSON معتمد بمصدره وترخيصه |
| `/quran/surah-stories` | المصدر `src/lib/surah-stories.ts` (كود لا JSON)؛ يلزم تصدير JSON معتمد بمصادره وحالة مراجعته |
| `/hifz-path*`، `/memorization`، `/quran-memorization`، `/quran/memorization-plans` | يحتاج تصدير خطة الحفظ من `lib/memorization-path` بعد مراجعة |
| `/mutashabihat` | `quran/mutashabihat-index.json` موجود؛ يلزم تصدير بعد مراجعة المصدر |
| `/miracles`، `/ulum-quran`، `/quran-knowledge` | مصدرها بذور/Supabase؛ يلزم حالة اعتماد |

## التفسير (مُنجز — قرار المالك: مُضمَّن)
`/tafsir` (المعرّف `tafsir`) يقرأ `Data/tafsir/{muyassar,saadi}/NNN.json` و`tafsir-registry.json` المصدَّرة أصلًا عبر `export-ios-data.mjs` (MANIFEST + sha256، بلا تعديل نص). ن4: لا إضافة للمُصدِّر؛ يكفي ربط `QuranSection.register` (يسجّل `tafsir` الآن). الحجم الخام ≈ 8.5MB (≈ 2.3MB مضغوطًا).

## أعلام القرآن والبحث (native-section/quran-batch2)
- `quran.people`: 104 علمًا (`status=published` كلها) من `Data/quran/people.json` عبر `scripts/native/sections/quran-people.mjs`؛ تفاصيل العلم داخل القائمة (تعريف، سبب الذكر، دروس، مواضع). روابط `relatedLinks` لم تُصدَّر (تُربط عند ن4 إن لزم).
- `quran.search`: بحث حرفي بنص Tanzil المحزوم عبر `MushafSearch` ويفتح المصحف عند صفحة الآية.
- ن4: يسجّلهما `QuranSection.register` نفسه؛ المُصدِّر يلتقط `quran-people.mjs` تلقائيًا.

## الدفعة 3 — ملفات `Data/quran/` الجديدة
tajweed.json، surah-stories.json، hifz-paths.json، stats.json، qiraat.json، ahruf.json (مولَّدة من `quran-ts.mjs`). الربط كما قبل: `QuranSection.register` (يسجّل الآن 6 شاشات إضافية + `pendingIDs`).

## اعتماد التجويد = وجود المصدر (لمراجعة شرعية بعد الإطلاق)

- الموقع لا يحمل حالة اعتماد لفصول التجويد؛ فاعتمادها في التصدير (`scripts/native/sections/quran-ts.mjs`) يعني **وجود حقل `source` غير فارغ** لكل فصل، وليس مراجعة شرعية.
- قصص السور وأحرف السبعة والقراءات والإحصاءات: تُصدَّر بمصدرها كما في الأصل؛ الحشو العام في القصص يُحجَب ويُسجَّل (`quran-surah-stories-filler`).
- المطلوب بعد الإطلاق: مراجعة شرعية لفصول التجويد الـ19 قبل عدّها معتمدة.

## دفعة 4: مسارات محلية

- `memorization`, `quran.memorization-plans`, `quran.hifz-loop`, `hifz-path.my`: حالة مستخدم في UserDefaults (`QuranLocalStore`، مفاتيح `sunnah.quran.*.v1`)، بلا خادم ولا نص قرآني (مراجع سورة/آيات فقط).
- `mushaf.bookmarks`: قائمة علامات `MushafStore` تفتح المصحف الحالي؛ لا تغيير في النص/الصفحات/الخطوط.
- `/c/:slug` (CitationPublicPage) يجلب من الخادم: لا يُبنى الآن. التفاصيل `hifz-path/c|p|u` داخل القائمة.
- اختبارات فك الترميز تقرأ ملفات فعلية في `Tests/SunnahNativeTests/Fixtures/quran` (تُجدَّد بإعادة التصدير).

## دفعة 5: الإشارات الكونية والمراكز
- `miracles.json` (من `miracles-seed.ts`): 67 إشارة `verified` ولها مصدر علمي؛ `needs_review` (67) محجوب (`quran-miracles`). النص كما نُشر في الموقع.
- `/quran-knowledge` فهرس روابط؛ `/quran-memorization` نفس مركز الحفظ.
- ملفات sirah وshamael وquran/search وsurah-stories: لا مفقود فعليًا — surah-stories مُصدَّر (114)، والبحث حرفي على Tanzil المحزوم، وfikr-waqia/seerah-phases/shamail فارغة عمدًا (بلا مصدر/درجة: قرار المالك)، وprophets-lineage غير مكتوب.
# من ن1 إلى ن3 — بيانات مسارات القرآن (التلاوة، الحلقات، مركز العبادة)

الأسماء والحقول موثّقة في `docs/native/contract/quran.md` (من مصدر الموقع، بلا إضافة):
- `Data/quran/tilawa-reciters.json` = `[{id,nameAr,order}]` (13 قارئًا؛ صوت كل قارئ من `audio/surah-reciters.json` بالمعرّف نفسه).
- `Data/quran/circles.json` = الحلقات المعتمدة النشطة (27 من البذرة)؛ يحدّثها التطبيق من الشبكة (`quran_circles`) كالموقع. المرشّحات (المستوى/المسار/الحضور/الجنس) تُحسب في الواجهة من الحقول.
- مركز العبادة: لا ملف خاص؛ يُركَّب من `quran/` وقائمة القرّاء والمواقيت المحسوبة داخل التطبيق.
إن احتجتم حقلًا آخر فاكتبوا هنا تحته وسأضيفه من المصدر نفسه.
