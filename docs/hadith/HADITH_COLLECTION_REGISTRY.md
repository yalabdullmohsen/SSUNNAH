# Hadith Collection Registry — سُنّة

**Canonical code:** `artifacts/majalis/src/lib/hadith/hadith-collection-registry.ts`  
**Date:** 2026-09-27  
**Rule:** Visible counts and availability labels derive from this registry — not duplicated UI literals.

## Dataset groups (never sum across groups)

| Group | Count | User label |
|---|---:|---|
| Local Sahihayn | 14,940 | متاح محليًا |
| Curated verified sample | 1,740 | مجموعة منسّقة |
| Arbaeen Nawawi | 42 | مسار تعليمي |
| Network catalog books | per edition | يتطلب اتصالًا · بحسب ترقيم المصدر |

## Availability statuses

`LOCAL_COMPLETE` · `LOCAL_PARTIAL` · `LOCAL_CURATED_SAMPLE` · `NETWORK_COMPLETE` · `NETWORK_PARTIAL` · `NOT_IMPORTED` · `BLOCKED_LICENSE` · `BLOCKED_SOURCE` · `BLOCKED_INTEGRITY` · `UNKNOWN`

`LOCAL_COMPLETE` requires automated validation: manifest count = actual rows, unique IDs, non-empty matn, pinned source/edition, stable integrity.

## Published local collections

| id | Local count | Availability | Classification | Offline |
|---|---:|---|---|---|
| bukhari | 7,580 | LOCAL_COMPLETE | sahih-by-collection | OFFLINE_READY |
| muslim | 7,360 | LOCAL_COMPLETE | sahih-by-collection | OFFLINE_READY |
| nawawi40 | 42 | LOCAL_COMPLETE (learning) | learning-path | OFFLINE_READY |
| verified-curated | 1,740 | LOCAL_CURATED_SAMPLE | curated-attributed-grade | OFFLINE_READY |

## Curated sample collections (subset of verified seed)

| id | Sample rows | Availability |
|---|---:|---|
| various | 590 | LOCAL_CURATED_SAMPLE |
| bukhari (overlay rows) | 504 | LOCAL_CURATED_SAMPLE (metadata overlay) |
| muslim (overlay rows) | 441 | LOCAL_CURATED_SAMPLE |
| mutafaq | 140 | LOCAL_CURATED_SAMPLE |
| nawawi40 (in seed) | 29 | LOCAL_CURATED_SAMPLE |
| tirmidhi | 20 | LOCAL_CURATED_SAMPLE |
| abudawud | 9 | LOCAL_CURATED_SAMPLE |
| ibnmajah | 4 | LOCAL_CURATED_SAMPLE |
| nasai | 3 | LOCAL_CURATED_SAMPLE |

## Network catalog (not local imports)

ara-bukhari · ara-muslim · nawawi · qudsi · ara-abudawud · ara-tirmidhi · ara-nasai · ara-ibnmajah · ara-malik · mutafaq  

Status: `NETWORK_REFERENCE_ONLY` · user label: يتطلب اتصالًا · numbering: بحسب ترقيم المصدر

## Not imported / blocked

| id | Status |
|---|---|
| riyadh | NOT_IMPORTED · LICENSE_REVIEW_REQUIRED |
| jawami | BLOCKED_LICENSE |
| silsila | BLOCKED_LICENSE |
| bulugh | NOT_IMPORTED |
| umdat | NOT_IMPORTED |
| ahmad | NOT_IMPORTED |
| darimi | NOT_IMPORTED |

## Integrity note (2026-09-27)

`hadith-verified/manifest.json` claimed 1,744 while four sahih chunks were off-by-one (actual **1,740**). Manifest counts were aligned to JSON array lengths. **No matn/sanad/grade content was altered.**

## Explicit non-claims

- Registry publication ≠ “all Hadith literature is in the app”
- Network catalog counts ≠ local record counts
- Curated 1,154 “sahih” sample rows ≠ all authentic Hadith
