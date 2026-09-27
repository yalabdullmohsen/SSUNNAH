# Hadith Source & License Matrix — سُنّة

**Date:** 2026-09-27  
**Related:** `artifacts/majalis/content/hadith-corpus/LICENSE_RISKS.md` · `HADITH_IMPORT_QUEUE.md`

## Status vocabulary

| Status | Meaning |
|---|---|
| APPROVED_FOR_LOCAL_DISTRIBUTION | May ship full local JSON mirror |
| APPROVED_WITH_ATTRIBUTION | May ship limited curated rows with attribution |
| NETWORK_REFERENCE_ONLY | Browse via network; do not claim local completeness |
| LICENSE_REVIEW_REQUIRED | Do not import until owner/license decision |
| BLOCKED_LICENSE | Do not redistribute locally |
| BLOCKED_SOURCE | Source identity inadequate |
| UNKNOWN | Do not advertise |

## Matrix

| Collection / dataset | Upstream | Pinned version | License status | Attribution | Local ship? |
|---|---|---|---|---|---|
| Sahihayn mirror (bukhari/muslim) | fawazahmed0/hadith-api | `@1` | APPROVED_FOR_LOCAL_DISTRIBUTION | MIT package + classical text | Yes |
| sample-50 search corpus | same mirror + membership grades | seed | APPROVED_WITH_ATTRIBUTION | Explicit membership wording | Yes (50) |
| hadith-verified curated | project curated seed | manifest aligned 1740 | APPROVED_WITH_ATTRIBUTION | Grade attribution when stored | Yes (sample) |
| Arbaeen Nawawi seed | project learning seed | seed-v1 | APPROVED_WITH_ATTRIBUTION | Source line on each card | Yes (42) |
| CDN sunan / qudsi / nawawi catalog | fawazahmed0/hadith-api | `@1` | NETWORK_REFERENCE_ONLY | Source link on books page | No full local |
| Riyad al-Salihin full book | — | — | LICENSE_REVIEW_REQUIRED | — | No |
| Sahih al-Jami / Silsilah full | contemporary takhrij | — | BLOCKED_LICENSE | — | No |
| Mawduat full printed editions | protected modern editions | — | BLOCKED_LICENSE | — | No |
| Musnad Ahmad / Darimi | — | — | LICENSE_REVIEW_REQUIRED | — | No |

## Transformation policy

Allowed:

- Empty-row skip at import (recorded in Sahihayn manifest `skippedEmpty`)
- Lean JSON field mapping (`n`,`t`,`b`,`h`,`a`)
- Separate Arabic-normalized search fields (derived)

Forbidden:

- Rewriting matn/sanad
- Inventing/altering grades
- Merging narrations by textual similarity
- Publishing blocked or license-ambiguous rows

## Before any future import

1. Identify upstream source  
2. Pin exact version  
3. Document redistribution terms  
4. Record attribution  
5. Preserve original IDs + numbering + edition  
6. Document transforms  
7. Generate checksums  
8. Pass automatic publication gate (26 conditions in program brief)  
9. AI alone never moves a row to READY_FOR_PUBLICATION  
