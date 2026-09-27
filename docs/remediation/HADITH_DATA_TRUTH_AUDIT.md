# Hadith Data Truth Audit — سُنّة

**Date:** 2026-09-27  
**Scope:** `/hadith*` · `/arbaeen-nawawi*` · `/hadith-science`  
**Content changes:** None (no matn/grade/attribution edits)

## Canonical datasets (do not sum)

| Dataset | Count | Availability | Source of truth |
|---|---:|---|---|
| Sahihayn local | **14,940** | متاح محليًا | `public/data/hadith/manifest.json` |
| — Bukhari | 7,580 | متاح محليًا | same |
| — Muslim | 7,360 | متاح محليًا | same |
| Verified curated | **1,740** | مجموعة منسّقة | `public/data/hadith-verified/manifest.json` (aligned 2026-09-27) |
| — sahih / daif / mawdu | 1,154 / 326 / 260 | | same chunks |
| Arbaeen Nawawi | **42** | مسار تعليمي | `lib/arbaeen-nawawi-seed.ts` |
| Network catalog | per-book | يتطلب اتصالًا · بحسب ترقيم المصدر | `HADITH_COLLECTIONS` CDN meta |

**Forbidden UX:** displaying `14940 + 1744 + 42` (or any cross-dataset sum) as one total.

## Numbering conflict (documented, not “fixed” by inventing equality)

| Book | Local mirror | CDN catalog |
|---|---:|---:|
| Bukhari | 7,580 | 7,563 |
| Muslim | 7,360 | 3,033 |

UI must label CDN figures as **بحسب ترقيم المصدر** and never claim they equal the local corpus.

## Classification model

| Signal | User label | Meaning |
|---|---|---|
| `takhrij_method: membership` + bukhari/muslim | من صحيح البخاري / من صحيح مسلم | Collection membership |
| curated metadata / muhaddith present | تخريج منسّق (± attributed name if present) | Curated row — no invented scholars |
| Independent stored grade on non-membership rows | شارة الحكم | Existing grade text only |

## Collection availability matrix

| Key | Class |
|---|---|
| bukhari, muslim | LOCAL_COMPLETE |
| nawawi40, mutafaq, riyadh, jawami, silsila, qudsi, various, tirmidhi, abudawud, nasai, ibnmajah, muwatta (when rows exist) | LOCAL_CURATED_SAMPLE |
| ara-* CDN editions, nawawi catalog | NETWORK_AVAILABLE |
| anything else | UNKNOWN (do not advertise) |

## Implementation anchors

- `src/lib/hadith/hadith-dataset-stats.ts`
- `src/lib/hadith/hadith-collection-availability.ts`
- `src/lib/hadith/hadith-authenticity-label.ts`
- `src/components/hadith/HadithDatasetSummary.tsx`
- `src/components/hadith/HadithEmptyState.tsx`
- Gate: `test:hadith-data-truth`

## HUMAN_RELIGIOUS_REVIEW

None opened in this wave (no content discrepancy requiring scholarly rewrite).

## Explicit non-claims

- Full-text global search over all 14,940 Sahihayn records — **not** implemented.
- Full offline sunan corpora — **not** claimed.
