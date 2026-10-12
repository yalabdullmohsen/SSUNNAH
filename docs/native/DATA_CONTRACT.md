# عقد البيانات — التطبيق الأصلي (SwiftUI)

يصف البيانات **كما هي** (لا إعادة تصميم). المصدر: `artifacts/majalis/public/data/*` و`api/` وSupabase (`ngmvmlulzacrlicuagyp`). الأحجام تقريبية (2026-10-11).
التحزيم يتم بسكربت واحد: `node artifacts/majalis/scripts/native/export-ios-data.mjs [--adhkar-json f] [--check]` → `ios-native/Data/` + `MANIFEST.json` (sha256 وحجم لكل ملف + عدّادات + المرفوض). يرفض: المحجوز في `content/content-hold.json`، النص الفارغ، الحديث غير الصحيح (ضعيف/موضوع/بلا درجة)، أسئلة demo/بلا شرح/بلا مرجع، الأذكار غير `verified`. `Data/` غير مُلتزَم (يُولَّد على الماك).
**محمي (لا يُعدَّل):** نص القرآن/ترقيمه/الصفحات الـ604، حساب المواقيت. القرآن من Tanzil فقط. ترقيم مسلم المحلي `n` تسلسلي: لا يُستشهد به.

## 1) مُحزَّم داخل التطبيق

| المجموعة | المسار (public/data/…) | الشكل | الحجم | ملاحظات |
|---|---|---|---|---|
| القرآن (Tanzil) | `quran/surah-001..114.json` | `{number:int,name:str,englishName:str,englishNameTranslation:str,revelationType:str,numberOfAyahs:int,ayahs:[{number:int,text:str,numberInSurah:int,juz:int,manzil:int,page:int,ruku:int,hizbQuarter:int,sajda:bool\|obj}]}` | 6.2 MB | تُنسخ بايتًا؛ يتحقق السكربت: 114 سورة / 6236 آية |
| فهارس القرآن | `quran/{manifest,pages-manifest,page-juz-index,quran-position-index,mutashabihat-index}.json` | فهارس مساعدة (صفحات/أجزاء/مواضع/متشابهات) | ~0.3 MB | `PROTECTED_BYTE_LOCK.json` يثبّت sha256 لبعضها |
| مصحف الصفحات (QPC v2) | `quran-v2/pages/page-001..604.json` + `chapters.json`, `page-boundaries.json`, `SOURCE.json` | صفحة = `[{id,verse_number,verse_key:str,hizb_number,rub_el_hizb_number,ruku_number,manzil_number,sajdah_number:int\|null,page_number,juz_number,words:[{id,position,audio_url,text_uthmani,text_qpc_hafs,code_v2,char_type_name,page_number,line_number,text,translation:{text,language_name,language_id},transliteration:{text,…}}]}]`؛ `chapters` = `[{id,revelation_place,revelation_order,bismillah_pre:bool,name_simple,name_complex,name_arabic,verses_count,pages:[a,b],slug:{slug,locale},translated_name:{language_name,name}}]` | 32 MB | محمي؛ يُحزم لاحقًا حسب قرار المصحف (غير مضمَّن في سكربت التصدير الحالي) |
| التفسير | `tafsir/{muyassar,saadi}/001..114.json` + `tafsir-registry.json` | `{surah:int,tafsirId:str,quranComSlug:str,ayahs:{"<رقم>":str}}`؛ registry: `{updatedAt,tafsirs:[{id,name,author,level,type,bundled:bool,quranComSlug,…}]}` | 8.3 MB | فجوات المصدر: الميسّر 5 آيات، السعدي 59 (تُسجَّل في المنافيست) |
| صحيح البخاري | `hadith/bukhari.json` | `{source,edition,collection,label,authenticity,note,count:int,skippedEmpty,skippedDup,fetchedAt,hadiths:[{n:int,t:str,b:int,h:int}]}` | ~8 MB، 7580 | `n` رقم الحديث، `b` الكتاب، `h` رقمه في الكتاب |
| صحيح مسلم | `hadith/muslim.json` | نفس الشكل، 7360 | ~8 MB | `n` تسلسلي محلي، لا يُعرض كرقم مرجعي |
| أحاديث موثّقة | `hadith-verified/{sahih,daif,mawdu}-NNN.json` + `manifest.json` | `[{id:str,collection,hadith_number:null\|str,title,text,narrator,source_name,grade,chapter,keywords:[str],explanation,authenticity_class:"sahih"\|"daif"\|"mawdu",metadata:{muhaddith,daraja_source},created_at}]` | 1.4 MB، 1740 | يُحزم `sahih` فقط (1160) → `hadith/verified-sahih.json` |
| الأذكار | لا ملف في المستودع؛ Supabase `verified_adhkar_items`/`verified_adhkar_categories`، وفضل الأذكار `src/data/adhkar-fadl.json` | عنصر: `{id:text,category_id,text,repeat_count:int,narrator,source_name,source_url,grade,reference,explanation,keywords:[str],global_ref_id,verification_status,quality_score:int2,trust_level:int2,metadata:jsonb,deleted_at,version_number,created_at,updated_at}`؛ فئة: `{id,slug,name,description,sort_order,source_slug,verification_status,trust_level,metadata,…}`؛ fadl: `{version,prefix,items:[{id,dhikr,fadl,…}]}` | 51 عنصرًا؛ fadl 7 KB | **كل الـ51 `needs_review` بلا درجة ⇒ المُصدَّر 0** حتى يُوثَّق؛ يُصدَّر بـ`--adhkar-json` (نتيجة select من الجدول) |
| فئات تذكير الأذكار | `src/data/adhkar-reminder-categories.json` | `{version,note,categories:[{id,group,t…,adhkarCategory}]}` | صغير | إعداد فقط، لا نصوص شرعية |
| أسئلة الاختبار | `quiz/<قسم>-NNN.json` (113 ملفًا) + `manifest.json` | `[{id:str,documentation_status:"sourced"\|"unsourced",section,category,level,question,answer,reference?,explanation?,trust_level,editorial_review_status,last_updated_at,source_class?}]`؛ manifest `{version,total:8491,generatedAt,chunks:[{file,count,key}]}` | 8.6 MB | يُحزم: (أ) الموثّق `sourced` بشرح ومرجع، (ب) العام `unsourced` (سيرة/صحابة/أنبياء/معلومات معروفة) بلا مرجع ولا شرح؛ دائمًا ليس `demo-*` وغير محجوز وبسؤال/جواب غير فارغين. أحكام الفقه/العقيدة بلا مرجع محجوزة في content-hold ولا تُصدَّر. التطبيق يجب ألا يفترض وجود `reference`/`explanation` وألا يعرض شارة «موثّق» لـ`unsourced` |
| مدن العالم/طرق الحساب | `prayer/world-cities.json` | `{v,generatedAt,count:927,countries:[{code,nameAr,method}],cities:[[…]]}` | 135 KB | الحساب نفسه داخل التطبيق (محمي) — لا جدول مواقيت |
| الصوت (سجل) | `audio/audio-registry.json` | `{version,updatedAt,notes,reciters:[{id,name,style,granularity,bitrate,folder,urlPattern,source,verified,filesPresent,qaPassedAt}],adhan:[{id,name,full,short30,fajr}],tafsir:{clips:[]}}` | 6 KB | الملفات الصوتية نفسها من الشبكة |
| أعلام القرآن | `quran-people/people.json` | `{version,updatedAt,notes,people:[{slug,nameAr,aliases:[],category,mentionType,prophetSlug,definition,whyMentioned,lessons:[],occurrences:[],status,relatedLinks:[]}]}` | 186 KB | غير مضمَّن في التصدير الحالي (يُضاف بعد مراجعة) |
| الرسم المعرفي | `graph/links.json` | `{version,generatedAt,descriptionAr,nodes:[{kind,slug,titleAr}],links:[{from,rel,to,labelAr}]}` | 11 KB | اختياري |

## 2) يُجلب من الشبكة (متغيّر أو كبير)

| المجموعة | المصدر | الشكل | الحجم | سبب الشبكة |
|---|---|---|---|---|
| الدروس | `public/data/lessons/{chunk-000,feed,manifest}.json` + `archive/YYYY-MM.json`؛ Supabase `lessons` (~325) | `[{id,external_key,title,speaker_name,sheikh_image_url,poster_image_url,category,city,region,mosque,day_of_week,lesson_time,schedule,description}]`؛ archive `{month,items:[{id,type,title_ar,summary_ar,sheikh,place,audience,starts_at,time_text,register_url,schedule_kind,women_attendance,…}]}` | 0.25 MB | يتغيّر يوميًا |
| الأسئلة الشرعية (QA) | `qa/*.json` (32) + `categories.json` `[{id,name,slug}]`؛ Supabase `qa_questions` (~370) | `{id,documentation_status,question,answer,category_id,ruling_type,evidence,reference,status,review_status,created_at,trust_level,editorial_review_status,last_updated_at}` | 2.7 MB | محتوى حي يُراجع؛ لم يُدقَّق للتحزيم |
| القصص | `stories/<تصنيف>-NNN.json` + `manifest.json`؛ Supabase `islamic_stories` (62), `prophet_stories` (25) | `{id:int,slug,title,category,era,icon,summary,full_content,key_lessons,related_figures,sources,tags,is_approved:bool,trust_level,editorial_review_status,last_updated_at}` | 1.9 MB | بانتظار توثيق المصادر |
| المعرفة | `knowledge/{manifest,nations/*,prophets/*,quiz/*,quran-people,tafsir/*,discover-islam,history,intro-islam}` | عنصر `{id,title,body,evidences:[{type,ref,text,grade,graded_by}],sources:[{book,author,locator}],tags,related,review_status,updated_at,section,meta}` | 8.4 MB | `review_status` يحدد الصلاحية؛ يُحزم `verified` فقط عند اعتماده |
| البحث | `search/index.json` `{version,count:4639,docs:[{id,kind,titleAr,href,norm,meta}]}` | | 1.8 MB | روابط الويب؛ التطبيق يبني فهرسه الخاص |
| المصادر/الحسابات | `sources/*` | `{version,updated_at,accounts:[{id,platform,handle,url,name_ar,kind,topics,…}]}` | 41 KB | تشغيلي للأتمتة فقط |
| الفقه | `fiqh/manifest.json` | `{version,contentType,checksum,files:[],offlineEligible}` | فارغ | لا محتوى بعد |
| علَم تشغيل | `{adhan-audio,quran-audio,tafsir-audio}-remote.json`, `tasmee-{flags,model}.json`, `tafsir-audio-{catalog,map}.json` | أعلام تعطيل/إعداد `{updatedAt,disabled*:[],notes}` | <2 KB | تحكم عن بُعد؛ التسميع معطّل افتراضيًا |

## 3) واجهات api/ (تُستهلك من الشبكة)
`api/*.js` نقاط دخول رفيعة تعيد توجيه إلى `artifacts/majalis/lib/api-handlers/*`: `healthz`, `assistant`, `prayer-times`, `cron/*`. المعالجات تشمل: `search`, `intelligent-search`, `knowledge-*`, `daily-content`, `feed`, `lesson-page`, `citations`, `content-delta`, `learning-*`, `reading-sync`, `push-subscribe`, `public-config`, `qf-chapter-audio`, `narration-tts`, `recitation-transcribe`, `researches-submit`، وغيرها. للتطبيق الأصلي لا غنى إلا عن `prayer-times` (احتياطي) و`public-config` و`daily-content`/`lesson-page`؛ الباقي ويب أو إدارة.

## 4) جداول Supabase ذات الصلة (عامة؛ ≈300 جدولًا، كثير منها فارغ)
| الجدول | الصفوف | أعمدة رئيسية | التحزيم |
|---|---|---|---|
| `quiz_questions` | ~958 | id uuid, section, category, level, question, answer, is_published, source_book/author/reference, explanation, verified, tags[], hint | شبكة؛ المُحزَّم من ملفات quiz |
| `qa_questions` | ~370 | id uuid, question, answer, category_id, ruling_type, evidence, reference, status, review_status, verification_status, slug | شبكة |
| `verified_hadith_items` | 342 (6 محذوف) | id text, collection, hadith_number text, title, text, narrator, scholar, source_name, source_url, grade, chapter, keywords[], explanation, verification_status, authenticity_class (sahih 269 / daif 13 / mawdu 19 / بلا 26) | شبكة؛ المُحزَّم من ملفات hadith-verified |
| `verified_adhkar_items` / `_categories` | 51 / — | انظر §1 | `needs_review` كلها ⇒ لا تحزيم |
| `lessons` | ~325 | id uuid, title, sheikh_id, mosque, city, category, schedule, lesson_time, day/start_time/end_time, live_url, audio_url, video_url, verification_status, trust_level, … (~80 عمودًا) | شبكة |
| `prayer_times` | ~19 | id, city, governorate, date, fajr, sunrise, dhuhr, asr, maghrib, isha | **لا يُحزم**: الحساب داخل التطبيق |
| `prophet_stories` | 25 | id, slug, arabic_name, citations jsonb, content, is_approved | شبكة |
| `islamic_stories` | 62 | id, slug, title, category, era, summary, full_content, key_lessons, related_figures, sources, tags, is_approved | شبكة |
| `dawah_questions` | ~85 | — | شبكة (قيد التدقيق) |

## 5) قواعد القبول (يفرضها السكربت)
1. المحجوز: أي `id` في `content/content-hold.json` يُستبعد من كل مجموعة.
2. الحديث: لا يدخل `daif`/`mawdu`/بلا درجة؛ نص ومصدر ودرجة إلزامية.
3. الأسئلة: ليس demo، لها `question`+`answer`+`explanation`+`reference` و`documentation_status≠unsourced`.
4. الأذكار: `verification_status=verified` ودرجة ومصدر وغير محذوف.
5. القرآن: 114 سورة، 6236 آية، أرقام متسلسلة، لا نص فارغ؛ نسخ بايتي.
6. المنافيست يسجّل العدّادات والمرفوض وsha256؛ `--check` يحسب دون كتابة.

## 6) أقسام التصدير (`scripts/native/sections/*.mjs`)
كل قسم ملف مستقل يُحمَّل تلقائيًا قبل كتابة المنافيست (`export-ios-data.mjs` يشغَّل عبر `node --import tsx`). الإخراج في `ios-native/Data/<قسم>/<اسم>.json` بالأسماء التي يتوقعها كود SunnahNative.

### aqidah (20 ملفًا في `Data/aqidah/`)
- الشكل: عناصر `{id,title,summary?,body?,reference?,...}` بحقول اختيارية تُحذف إن خلت؛ الملفات المجمَّعة (adab-talab-ilm, akhlaq, hikam-salaf, janna-naar, malaika, raqaiq, alamat-saah) مجموعات `{id,title,items:[...]}`.
- المحجوز (`content-hold.json`) مستبعد من كل ملف، وتُسجَّل الرفوض في المنافيست.
- `asma-husna`: تُرفض العناصر `documentation_status=unsourced` (91 من 99).
- `islamic-sects`: `[]` **فارغ عمدًا** — لا سجل منشور (كلها NEEDS_SOURCE/NEEDS_HISTORICAL_REVIEW/NEEDS_SHARIA_REVIEW/CONFLICTING_SOURCES).
- الشبهات وأدلة الدعوة (`discover-islam-questions/doubts`): كل آية قرآنية تُطابَق حرفيًا مع Tanzil (اسم السورة+الرقم+النص، والاقتباس المقطّع بـ`...` قطعةً قطعة)؛ ما لا يتحقق يُرفض (doubts: 1 من 12).
- `discover-islam-articles/new-muslim`: تُمرَّر كما هي دون أدلة.
- لا ملف لـ`discover-islam` (مركز) ولا `discover-islam-contact` (نموذج).

### fiqh (18 ملفًا في `Data/fiqh/`)
- `books` `{version,generatedAt,madhhab,books:[…]}` و`book-aliases` `{aliases:[…]}` من `content/fiqh/*.json`؛ الدرس/الباب/الكتاب المحجوز يُحذف (الآن `hajj-arkan-arafa`، فيزول تكرار `needsReview`)، والمرادفات تُرشَّح لتبقى أهدافها موجودة.
- `guides/<slug>.json` (jumuah, nikah, riba, ruqya, sadaqa, talaq, udhiya, waqf): كائن `FiqhGuideSection` كما هو، بعد حذف البطاقات المحجوزة.
- مصفوفات: `madhahib`, `maqasid-sharia`, `prayer-ranks`, `usul-topics`, `prophetic-medicine`.
- `sins-and-rights` `{topics,categories}` و`amr-bil-maruf` `{levels,conditions,munkaraat,maaruf}`.
- تمرير حرفي من مصدر الويب؛ لا إعادة صياغة ولا حقول جديدة. المسارات الـ17 المكتوبة داخل JSX (`/tahara` `/sawm`…) خارج هذا الـPR (تحتاج نقل نص إلى وحدة بيانات أولًا).


### sirah (10 ملفات في `Data/sirah/`)
- مصفوفات بالشكل الحرفي للمصدر، بعد حذف المحجوز: `islamic-landmarks`, `nations`, `sahabah` (مضمَّنة في الصفحة؛ `quote` لا يُعرض).
- بمرشحات القبول: `occasions-verified` (سجل موثّق مطابق لبذرة بـ`reviewStatus=approved` ومصدر)، `prophets-knowledge` (`review_status=verified` + مصادر)، `stories` (معتمدة + `reviewed` + مصادر)، `islamic-history` (لا `needs-review` ولا بلا مصادر).
- فارغة عمدًا (`[]`) لغياب مصدر/درجة في الويب وقرار المالك: `fikr-waqia`, `seerah-phases`, `shamail`.
- `prophets-lineage` لا يُكتب (جذر واحد لا قائمة، ولا عقدة فارغة صالحة): غيابه = «قيد التوثيق».

### learn + audio (11 ملفًا: `Data/learn/`، `Data/lessons/`، `Data/graph/`، `Data/audio/`)
- بيانات حقيقية: `lessons/chunk-000` (82)، `learn/universities` (37 متحقَّقة)، `learn/kuwait-sheikhs` (6)، `graph/links`، `audio/surah-reciters` (29: `{id,nameAr,surahBaseUrl}` بعد مفتاح التعطيل المركزي).
- فارغة عمدًا بالشكل الصحيح `[]`: `institutions` (قرار المالك: المراجَع فقط)، `competitions`، `durus-imaniyya`، `durus-mutanawwia` (تنتظر sharia-content)، `fawaid`، `annual-courses` (مصدرها Supabase).

### library (11 ملفًا في `Data/library/`)
- بالشكل الحرفي للمصدر بعد حذف المحجوز: `academic-research` (`{records, categories}`؛ منشور وغير تجريبي فقط)، `arabic-language` و`mawsuaat` (`DarsSection[]`)، `islamic-glossary` (ذو مصدر فقط؛ 20 بلا مصدر مستبعدة)، `mind-maps` (+ نسخة مطابقة `mind-map`)، `scientific-announcements`.
- `search-index` = `{docs:[{id,kind,titleAr,href,norm}]}` من `public/data/search/index.json` بعد الحجب العام والمحجوز.
- `terms` و`methodology` = `{title, updatedAt, sections:[{title, paragraphs}]}` نصّ الصفحة حرفيًا (البريد من `site.config.json`).
- `navigation` = `{groups, sections, settingsRows, sitemap}` من سجل الأقسام (بلا مجموعة account، بلا hidden/comingSoon) وصفوف «المزيد» ودليل الأقسام.
- لا تُصدَّر: `sources` والدروس (شبكة)، `cards`/`academic-research-assistant`/`-submit` (محسوبة محليًا)، `more`/`sections`/`sitemap`/`search`/`islamic-directory` (أسماء الشاشات المولَّدة؛ المحتوى في `navigation`/`search-index`).

### adhkar (adhkar/verified-adhkar.json = 207 صفوف، من content/native/adhkar-verified.json)
- المصدر: بذرة الأذكار الأصلية `src/lib/adhkar-seed.ts` عبر `scripts/native/build-adhkar-verified.mjs`؛ النص والمصدر والدرجة حرفيًا بلا إنشاء ولا مرجع جديد، والدرجة كما هي (حسن تبقى «حسن»). الشكل هو صف `verified_adhkar_items` (§1) مع `metadata.basis`: `sahihayn` (140) · `named_grader` (33: صحيح بمصحِّح مسمّى) · `named_grader_hasan` (15: حسن بمصحِّح مسمّى) · `local_verified_corpus` (2: مطابقة متن كاملة لسجل في hadith-verified بمرجعه في `metadata.local_ref`) · `quran_tanzil` (17).
- المحجوز (64 ← content-hold): 16 ضعيف + 48 صحيح بلا مصحِّح مسمّى ولا مرجع محلي. المُرجأ (54، لا يُصدَّر ولا يُحجز): حسن بلا مصحِّح مسمّى 53، وصيغة «صلى الله عليه وسلم» 1 (ليست نص حديث؛ صيغة الصلاة الإبراهيمية الثابتة في الصحيحين مصدَّرة أصلًا).
- `native-export-data.sh` يمرّر الملف تلقائيًا؛ إن اعتمد المالك صفوف Supabase الـ51 دُمجت لاحقًا بنفس الشكل.
