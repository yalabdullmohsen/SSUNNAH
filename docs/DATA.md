# DATA — جرد بيانات سُنّة (2026-10-06)

> المرجع الوحيد لأماكن البيانات ومصادرها وطريقة تحديثها. «A/» = `artifacts/majalis/`.
> ثوابت: نص القرآن ومواضعه محميّ (`.claude/rules/protected-content.md`) · لا نص شرعي من الذاكرة · بيانات المستخدمين لا تُمس · التعارضات في [DATA_CONFLICTS.md](DATA_CONFLICTS.md) لقرار المالك.
> البوابة: `pnpm --filter @workspace/majalis run test:data-integrity` (مرجع/درجة، معرّفات مكررة، حقول فارغة، مخطط، تطابق manifest). فحص روابط الصوت شبكي خارج المسار الإلزامي: `node scripts/audit-reciters-playability.mjs`.

## 1) ملفات مضمّنة — `A/public/data/**` (تُخدَم ثابتة، ~88MB، 1234 ملفًا)

| المجموعة | المسار | الحجم/العدد | المصدر | الترخيص | آخر تحديث | الاستخدام |
|---|---|---|---|---|---|---|
| المصحف (نص/صفحات) | `quran/` (120) · `quran-v2/` (609) | 6.3MB · 32MB | Tanzil + QPC/QUL (Quran Foundation) — محمي ببايت لوك `quran-v2/PROTECTED_BYTE_LOCK.json` | Tanzil بنسبة؛ QPC `LICENSED_CONDITIONAL` | 2026-09-18 · 2026-08-08 | المصحف والبحث — **لا يُعدَّل** |
| التفسير | `tafsir/` (230: الميسر، السعدي) | 8.6MB | Quran.com / QUL (`tafsir-registry.json`: المؤلف والرابط وتاريخ الوصول) | نسبة كاملة في /sources (§13) | 2026-09-05 | صفحة التفسير |
| الصحيحان | `hadith/bukhari.json`, `muslim.json` | 16MB · 14,940 حديثًا | `fawazahmed0/hadith-api@1` (sha256 في manifest) | غير مسجّل في المصفوفة — **قرار مالك** (§4) | 2026-08-26 | مكتبة الحديث |
| الأحاديث المحققة | `hadith-verified/` (10 أجزاء) | 1,740 · 1.4MB | تجميع داخلي لكل عنصر `source_name`+`grade` | داخلي (مصادر مذكورة لكل عنصر) | 2026-09-27 | صحيح/ضعيف/موضوع |
| المعرفة | `knowledge/` (70) | 8.3MB | توليد داخلي بمخططات `A/data/schemas/*` | داخلي | 2026-09-16 | الأنبياء/الأمم/التاريخ/التعريف بالإسلام |
| سؤال وجواب | `qa/` (30 جزءًا) | 2,295 | داخلي مع `reference` | داخلي | 2026-09-12 | /qa |
| بنك الأسئلة | `quiz/` (112 جزءًا) | 8,491 فعليًا | داخلي | داخلي | 2026-08-31 | المسابقات |
| القصص | `stories/` (23 جزءًا) | 479 (المعرّف الثابت = `slug`) | داخلي مع `sources` | داخلي | 2026-09-09 | /stories |
| الدروس | `lessons/` (chunk + `feed.json` + archive) | 82 + الحصاد | Supabase + حصاد يوتيوب/تيليجرام/إنستغرام | روابط فقط | 2026-10-05 | /lessons |
| حسابات الحصاد | `sources/` | 4 ملفات | `scripts/harvest` | — | 2026-10-05 | الحصاد |
| أعلام القرآن | `quran-people/` | 188KB | داخلي | داخلي | 2026-09-09 | — |
| فهرس البحث | `search/` | 1.8MB | مولّد من البيانات أعلاه | — | 2026-10-03 | البحث |
| مدن المواقيت | `prayer/world-cities.json` | 136KB | مولّد داخليًا (927 مدينة + طريقة الحساب لكل دولة) | — (أسماء وإحداثيات) | 2026-08-11 | المواقيت |
| سجل الصوت | `audio/audio-registry.json` + `*-audio-remote.json` | 13 قارئًا | everyayah / mp3quran | `STREAM_ONLY` | 2026-09-19 | المشغّل |
| أخرى | `graph/`, `fiqh/manifest.json`, `tafsir-audio-*` | صغيرة | داخلي | — | 2026-08/09 | — |

## 2) بيانات داخل الحزمة — `A/src/data/**` و`A/src/lib/*-seed.ts`

| المجموعة | المسار | العدد | المرجع/الدرجة |
|---|---|---|---|
| الأذكار | `src/lib/adhkar-seed.ts` | 325 ذكرًا، 0 بلا مصدر/درجة | `source`+`reference`+`grade` |
| ذكر الشريط اليومي | `src/lib/daily-ticker-dhikr.ts` | جزء من الأذكار | `source` اختياري (بلا درجة) |
| الأربعون النووية | `src/lib/arbaeen-nawawi-seed.ts` | — | `source` فقط (بلا درجة؛ الأربعون صحاح/حسان بحكم النووي — يحتاج إثبات الدرجة لكل حديث) |
| أحاديث احتياطية | `src/lib/verified-hadith-fill-*.ts` (10 ملفات، ~1.5MB) | — | `source_name`+`grade` |
| فئات تذكير الأذكار | `src/data/adhkar-reminder-categories.json` | 18 | — |
| المكتبة/الجامعات/المؤسسات/الفرق/التاريخ/المسابقة | `src/data/*.json|ts` | 17 ملفًا | داخلي |

## 3) Supabase (الإنتاج `ngmvmlulzacrlicuagyp` — قراءة فقط للوكلاء)

| الجدول | الصفوف | آخر `updated_at` |
|---|---|---|
| sharia_rulings | 690 | 2026-07-18 |
| verified_hadith_items | 342 | 2026-07-24 |
| verified_adhkar_items / categories | 51 / 3 | 2026-06-27 |
| qa_questions | 370 | 2026-07-26 |
| quiz_questions | 958 | 2026-07-18 |
| lessons / lesson_sections | 325 / 689 | 2026-07-23 / 07-26 |
| prophet_stories / islamic_stories | 25 / 62 | 2026-07-04 / 07-22 |
| knowledge_items / learning_items / search_index | 84 / 333 / 333 | 2026-06-30 / 07-19 / 07-02 |
| dawah_questions / shubuhat / articles | 85 / 18 / 12 | 2026-07-22 |
| courses / categories | 62 / 360 | 2026-07-19 / 07-23 |
| fiqh_council_issues / items | 64 / 4 | 2026-02-10 / 07-26 |
| content_provenance / global_content_refs | 710 / 640 | 2026-07-30 |
| arbaeen_love_of_allah / week_day_facts | 35 / 5 | 2026-07-17 |
| fatwas / hadith_profiles / quran_surah_profiles | 0 / 0 / 0 | — (فارغة) |

جداول المستخدمين (لا تُمس، وأي تغيير معرّفات بترحيل): `bookmarks`, `user_progress`, `reading_resume`, `user_notes`, `user_saved_citations`, `muezzin_favorites`, `quiz_attempts`, `lp_user_progress`, `user_*`. محليًا: `majalis:hadith-saved` (معرّفات الأحاديث)، مفضلة السور والأمم (`slug`)، علامات المصحف.
بقية الجداول (~250) سجلات تشغيل لأنابيب المحتوى الآلية (mke_/akp_/ake_/content_production_*) وليست محتوى معروضًا.

## 4) واجهات خارجية

| المضيف | الملف | الغرض | الترخيص |
|---|---|---|---|
| apis.quran.foundation | `A/lib/api-handlers/qf-chapter-audio.js` (خادم، مفاتيح في Vercel) | صوت السورة + التوقيتات | `LICENSED_CONDITIONAL` (نسبة، كاش ≤ أسبوع) |
| api.alquran.cloud | `src/lib/quran-api.ts` وغيره | ترجمات/طبعات | — |
| api.qurancdn.com، quran.com | `src/lib/quran-data/qpc-page-data.ts` | كلمات الصفحات والخطوط | QF |
| everyayah.com، serverN.mp3quran.net، cdn.islamic.network | `src/lib/quran-audio.ts` | التلاوات (29 قارئًا — كلها سليمة في فحص 2026-10-06) | `STREAM_ONLY` |
| cdn.jsdelivr.net/gh/fawazahmed0/hadith-api | `src/lib/hadith-cdn-service.ts` | نصوص الحديث | غير مسجّل — قرار مالك |
| cdn.jsdelivr.net/gh/mohsalvi/adhan-audio | `src/lib/adhan-audio.ts` | الأذان | انظر المصفوفة |
| api.aladhan.com | `A/lib/prayer-times-core.mjs`, `A/lib/sync-data.mjs` | المواقيت والهجري | — |

## 5) آلية التحديث

- **الحصاد المجدول**: `.github/workflows/harvest-sources.yml` (03:00/15:00 UTC) → `scripts/harvest/run.mjs` يكتب `lessons/feed.json` و`archive/` و`sources/*` ويفتح PR بوسم `safe:content`؛ السجل في `sources/harvest-report.json`.
- **الدفعات عن بُعد**: التطبيق يحمّل الموقع الحي، فتحديث الملفات أعلاه يصل بالنشر. `/api/content-delta` (`A/lib/api-handlers/content-delta.js`) يعيد `packs: []` حاليًا (لا حزم منشورة)؛ العميل `src/lib/delta-content-sync.ts` يرسل `since_<pack>=<rev>` ويطبّق العمليات في IndexedDB ويحفظ المراجعة في `majalis-delta-sync-state-v1`، وعند انقطاع الشبكة/الفشل يبقى على النسخة المضمّنة.
- **الإصدار**: كل مجموعة مجزأة لها `manifest.json` بحقل `version` و`chunks[].count` (تطابقها البوابة).
- **المخططات**: `A/data/schemas/datasets.mjs` (zod) + `A/data/schemas/*.schema.json` للمعرفة.
