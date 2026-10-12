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
