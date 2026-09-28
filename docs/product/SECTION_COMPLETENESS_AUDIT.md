# Section Completeness Audit — سُنّة

**Wave:** PLATFORM_SECTION_REGISTRY_W1 · **Date:** 2026-09-28  
**Catalog size:** 39

## Rollup by availability

| Availability | Count |
|---|---:|
| PARTIAL | 25 |
| CURATED | 6 |
| LIVE_DATA | 2 |
| BLOCKED_INCOMPLETE | 2 |
| COMPLETE | 2 |
| OFFLINE_AVAILABLE | 1 |
| COMING_SOON | 1 |

## Owner-required sections — honesty notes

| # | Section | Availability | Blocker / next program |
|---|---|---|---|
| 1 | الدروس والدورات العلمية (الكويت) | LIVE_DATA | Needs governorate/source/last-verified contract (Program 4). |
| 2 | سين جيم | CURATED | Must never present AI answers as rulings. |
| 3 | العقيدة الإسلامية | PARTIAL | Needs structured curriculum completeness pass. |
| 4 | السيرة النبوية | PARTIAL | Distinguish Quran/Hadith/history layers in later waves. |
| 5 | قصص الأنبياء | PARTIAL | Narration UI exists; content integrity gates apply. |
| 6 | الحديث وعلومه | CURATED | Hadith registry merged; full Sahihayn search still follow-up. |
| 7 | التجويد | PARTIAL | Program 7 progressive paths not yet complete. |
| 8 | علوم القرآن | PARTIAL | Needs completeness contract on detail pages. |
| 9 | القرآن الكريم / المصحف | OFFLINE_AVAILABLE | Bookmarks V2 shipped; never mutate Quran text. |
| 10 | أسباب النزول | PARTIAL | Require pinned source editions before claiming COMPLETE. |
| 11 | الأمم السابقة | PARTIAL | No fabricated narratives. |
| 12 | الإعجاز العلمي | CURATED | Keep methodology warnings; scientific docs exist. |
| 13 | الفقه الإسلامي | PARTIAL | Educational limitation banners required on rulings. |
| 14 | التاريخ الإسلامي | PARTIAL | History search docs exist; still not full curriculum contract. |
| 15 | الفرق الإسلامية | COMING_SOON | comingSoon=true in sections.registry; publish guards exist. |
| 16 | مقاصد الشريعة | PARTIAL | Accordion bodies exist; completeness contract still weak. |
| 17 | أصول الفقه | PARTIAL | Fiqh door summaries exist; not full curriculum. |
| 18 | مكارم الأخلاق | PARTIAL | Needs structured lesson contract. |
| 19 | دلائل النبوة | PARTIAL | Accordion depth gates exist; still not COMPLETE. |
| 20 | التعريف بالإسلام (متعدد اللغات) | PARTIAL | Machine translation must not be final authority. |
| 21 | تفنيد الشبهات | BLOCKED_INCOMPLETE | Embedded in discover-islam; needs dedicated center + provenance. |
| 22 | النحو والبلاغة | BLOCKED_INCOMPLETE | Arabic Grammar W1 audit local; Wave 2 needs approved source for الإِعراب والبناء. |
| 23 | دليل المؤسسات الإسلامية | PARTIAL | Route/view exist; missing from sections.registry SEEDS. |
| 24 | دليل المساجد التاريخية | PARTIAL | Route exists; /mosques redirects to islamic-directory. |
| 25 | الأبحاث العلمية | PARTIAL | Prefer metadata index when full-text not licensed. |
| 26 | دليل الجامعات والكليات الشرعية | PARTIAL | Never fabricate accreditation. |
| 27 | الأذكار | CURATED | Unify with duas/tasbih/sunan in Program 17. |
| 28 | الوصايا | PARTIAL | Need source attribution pass. |
| 29 | فضائل الأعمال | PARTIAL | No unsupported reward claims. |
| 30 | السنن النبوية اليومية | PARTIAL | Unify completion state with adhkar. |
| 31 | آداب طالب العلم | PARTIAL | Route/view exist; not in sections.registry seeds. |
| 32 | الفوائد المنتقاة | CURATED | Curated feed; provenance per item varies. |
| 33 | الأدعية | CURATED | Unify with adhkar program. |
| 34 | التسبيح | COMPLETE | Tool completeness ≠ content encyclopedia. |
| 35 | القبلة | COMPLETE | Device sensors; DEVICE_REQUIRED validation. |
| 36 | مواقيت الصلاة | LIVE_DATA | Do not change calculation algorithms without dedicated tests. |
| 37 | تنبيهات الدروس | PARTIAL | Avoid duplicate schedules; permission states required. |
| 38 | تنبيهات الأذان | PARTIAL | Native sound assets must stay in bundle resources. |
| 39 | المساعد العلمي | PARTIAL | Must expose sources + limitation when no approved hit. |

## Critical honesty findings

1. **النحو والبلاغة:** 95 public accordion lessons, **0** COMPLETE (`BLOCKED_INCOMPLETE` / MISSING_SOURCE).
2. **الفرق الإسلامية:** forced `COMING_SOON` — do not expose as complete encyclopedia.
3. **تفنيد الشبهات:** hub-embedded only — needs dedicated provenance center (Program 13).
4. **Registry gaps:** closed in PLATFORM_REGISTRY_GAPS_W1 — directories map to `islam-guide`/`/islamic-directory`; `adab-talab-ilm` seeded in nav registry.
5. **No curriculum section marked COMPLETE** in this wave (tools only: تسبيح / قبلة).

## Empty / decorative risk

Any section with availability `PARTIAL` or `BLOCKED_INCOMPLETE` must **not** be marketed as a finished course. Detail pages that are title+paragraph+summary fail the Content Completeness Contract (Program 3) and are tracked for later waves.

## Prior completed work (do not duplicate)

- Foundation V2 / Card System V2 / Calm Visual W1–W2
- Hadith collection registry
- Mushaf bookmarks V2
- Search integrity waves
- Admin console architecture
- Navigation IA (drawer groups) — product IA groups are complementary

## Next bounded waves (recommended order)

1. ~~Register REGISTRY_GAP destinations~~ → done (PLATFORM_REGISTRY_GAPS_W1)
2. ~~Kuwait lessons data model (Program 4)~~ → KUWAIT_LESSONS_MODEL_W1 (import provenance follow-up)
3. Arabic grammar Wave 2 — only with approved source
4. Shubuhat center provenance
5. ~~Search: exclude COMING_SOON / BLOCKED~~ → SEARCH_BLOCKED_EXCLUDE_W1
6. Align drawer/homepage to IA groups in a single bounded PR
