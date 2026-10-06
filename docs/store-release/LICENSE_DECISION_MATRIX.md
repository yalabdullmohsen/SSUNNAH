# LICENSE_DECISION_MATRIX — Owner prep (no legal decisions by agent)

| Field | Value |
|-------|-------|
| Tip | `0c4e808f` MATCH |
| Updated | 2026-10-06 |
| Rule | Agent classifies only · Owner decides GRANT / STRIP / STREAM_ONLY |

| Asset class | Current repo posture | Classification | Owner options | Blocks |
|-------------|---------------------|----------------|---------------|--------|
| QPC / QUL fonts | Used on web Mushaf | `LICENSED_CONDITIONAL` (owner decision 2026-10-06) | Licensed via Quran Foundation developer terms («may cache or bundle font files… if the Developer maintains an active account») — conditions: keep the QF developer account active + visible attribution to Quran Foundation (on /sources). If the account lapses → `GRANT_REQUIRED` again | none while conditions hold |
| Quran Foundation content (recitation audio + ayah timings) | Server-side proxy `/api/qf-chapter-audio` (keys in Vercel env only) | `LICENSED_CONDITIONAL` | QF terms: attribution on /sources · no caching of QF content > 1 week except via QF Content Sync (proxy cache = 1 day; offline downloads stay on mp3quran) | — |
| Sahihayn text (`fawazahmed0/hadith-api@1`) | Bundled `public/data/hadith/*.json` + runtime `hadith-cdn-service.ts` (docs/DATA.md) | `OWNER_DECISION` (unclassified until 2026-10-06) | Verify upstream repo license & attribute on /sources **or** replace with a licensed edition | — |
| Hisn Muslim edition | Corpus present / rights uncertain | `GRANT_REQUIRED` or replace | Permission letter **or** replace edition **or** feature-flag off | STORE HOLD |
| Quran recitations audio | Policy STREAM_ONLY · kill switch | `STREAM_ONLY` | Keep stream forever **or** signed offline ToS | Offline pack · Watch corpus |
| Adhan Istanbul CC0 | `CC0_ADHAN_REJECTED_QUALITY` | `OWNER_DECISION` | Keep rejected · find other CC0 · system sound | AUDIO_CERTIFIED |
| Adhan madinah / qatami | Not approved for production UI | `OWNER_DECISION` / keep blocked | Approve with rights evidence **or** permanent reject | Store audio packs |
| CAF / non-CC0 adhan packs | Risk for store binary | `STRIP_REQUIRED` (default safe) | Exclude from Store RC **or** clear rights | STORE HOLD |
| Books / lessons / fatwa bodies | Metadata-first · UNKNOWN bodies risk | `STRIP_REQUIRED` for UNKNOWN in RC | Metadata-only Store RC · clear sources | CONTENT_CERTIFIED |
| Images / third-party art | Catalog incomplete for store | `OWNER_DECISION` | Complete catalog · remove UNKNOWN | Attributions / store |

```text
CONTENT_CERTIFIED = false
AUDIO_CERTIFIED = false
STORE_SUBMISSION_READY = false
STORE_GO = false
```

## نغمات تذكير الأذكار (2026-10-06)
القاعدة: يُقبل فقط CC0/ملك عام أو ترخيص تجاري صريح داخل التطبيق بلا اشتراط نسبة؛ وما سوى ذلك مرفوض. لم يُعثر على مكتبة تستوفي الشرط بدليل قاطع، فوُلّدت نغمات **أصلية برمجيًا** (موجات جيبية بغلاف تلاشٍ) بالسكربت `artifacts/majalis/scripts/generate-reminder-tones.mjs` — لا تسجيلات ولا عيّنات خارجية، ولا أذان ولا تلاوة.

| الملف (iOS: `ios/App/App/Sounds/*.caf` · الويب: `public/audio/reminder-tones/*.m4a`) | المصدر | الترخيص | المدة | التاريخ |
|---|---|---|---|---|
| `tone-nada` (جرس هادئ) | مولّد بالسكربت أعلاه | عمل أصلي — CC0 (https://creativecommons.org/publicdomain/zero/1.0/) | 3.2ث | 2026-10-06 |
| `tone-chime` (نغمتان صاعدتان) | مولّد بالسكربت أعلاه | عمل أصلي — CC0 | 3.0ث | 2026-10-06 |
| `tone-fajr` (ثلاث نغمات متتابعة) | مولّد بالسكربت أعلاه | عمل أصلي — CC0 | 3.6ث | 2026-10-06 |
| `tone-qatra` (قطرة) | مولّد بالسكربت أعلاه | عمل أصلي — CC0 | 1.6ث | 2026-10-06 |
| `tone-nasim` (نسيم — وتر هادئ) | مولّد بالسكربت أعلاه | عمل أصلي — CC0 | 4.0ث | 2026-10-06 |
| «صوت النظام» | صوت iOS الافتراضي | لا ملف داخل الحزمة | — | 2026-10-06 |
| «صامت» | بلا صوت | — | — | 2026-10-06 |

`Classification: CLEARED_ORIGINAL` — لا تحتاج قرار مالك. إدخالها في تطبيق iOS = **نسخة متجر** (ملفات داخل الحزمة + مدخلات project.pbxproj).
