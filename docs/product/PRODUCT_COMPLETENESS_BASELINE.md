# PRODUCT_COMPLETENESS_BASELINE

**Phase:** `SUNNAH_PRODUCT_POLISH_AND_FEATURE_PARITY_PROGRAM`  
**Base tip:** `0d28dcdc` (post runtime excellence)

## Journey surfaces

| Journey | Feedback contract | Offline | A11y notes |
|---|---|---|---|
| Home | OfflineBanner chrome | defined | — |
| Search | OfflineStateV2 · ErrorStateV2 · NoResultsState | Offline ≠ Error | chips `--touch-min` |
| Lessons | OfflineStateV2 · ErrorStateV2 · NoResults · Empty | Offline ≠ Error | — |
| Hadith | HadithEmptyState → NoResults/Offline/Error V2 | defined | — |
| Fiqh | Loading/Error/Offline/NoResults V2 | Offline ≠ Error | — |
| Quran Hub | prior route feedback | — | — |
| Mushaf | immersive shells (prior) | OfflineCenter link | — |
| Prayer | prior Error/Empty paths | — | no calc change |
| Account / Glossary | NoResultsState on filter miss | — | clear filters |
| Settings / Offline Center | OfflineStateV2 when offline | messaging only | pack list labels |

## Feedback matrix (authority)

| Situation | Component |
|---|---|
| No data at all | `EmptyStateV2` |
| Filter/search miss | `NoResultsState` |
| Online failure | `ErrorStateV2` (+ retry) |
| Offline | `OfflineStateV2` |
| Loading | `LoadingStateV2` |
| App chrome offline | `OfflineBanner` |

## Classification

| Class | Items |
|---|---|
| FIXABLE_IN_REPOSITORY | Search inline error · Fiqh/Adhkar Empty-as-Error · Hadith kind routing · Glossary NoResults · Lessons offline · Offline Center messaging · search chip touch |
| KEEP_JUSTIFIED | Prayer calc surfaces · Quran integrity · search ranking |
| DEVICE_REQUIRED | Live a11y audit on device |
| SPECIAL_CASE | Admin V3 |

UNKNOWN_PRODUCT_DEBT = 0 for classified program surfaces.
