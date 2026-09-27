# Root Remediation Progress — سُنّة

Living tracker for remediation waves. Do not treat as release truth (see `docs/release/CURRENT_PROJECT_STATUS.md`).

## Recent waves

| Wave | Focus | State | Notes |
|---|---|---|---|
| WAVE4_PUBLICATION_HONESTY | Publication honesty | prior | `docs/remediation/WAVE4_PUBLICATION_HONESTY.md` |
| WAVE5_ADMIN_V3_SHELL | Admin shell | prior | `docs/remediation/WAVE5_ADMIN_V3_SHELL.md` |
| WAVE6_ADMIN_V3_CENTERS | Admin centers | prior | `docs/remediation/WAVE6_ADMIN_V3_CENTERS.md` |
| **WAVE_SEARCH_INTEGRITY** | Search href contract + history destinations + index v3 | **merged (#2303)** | `docs/remediation/waves/WAVE_SEARCH_INTEGRITY.md` |
| WAVE_HADITH_DATA_TRUTH | Hadith counts, labels, filters, empties | IMPLEMENTED | `docs/remediation/waves/WAVE_HADITH_DATA_TRUTH.md` |
| **WAVE_HADITH_COMPLETION_P1** | Registry + completeness/license docs + count align | **merged (#2302)** | `docs/remediation/waves/WAVE_HADITH_COMPLETION_P1.md` |
| **WAVE_PRODUCT_REDESIGN_W1** | Foundation V2 + Card V2 + states + UX audit | **PR in flight** | `docs/remediation/waves/WAVE_PRODUCT_REDESIGN_W1_FOUNDATION.md` · local verify:ci pass |

## Search integrity docs

| Doc | Path |
|---|---|
| Audit | `docs/remediation/SEARCH_ROUTE_INTEGRITY_AUDIT.md` |
| Validation | `docs/remediation/SEARCH_ROUTE_VALIDATION.md` |
| Exclusions | `docs/remediation/SEARCH_INDEX_EXCLUSIONS.json` |
| Versioning | `docs/remediation/SEARCH_INDEX_VERSIONING.md` |
| Living audit | `docs/remediation/SEARCH_AUDIT.md` |

## Hadith program docs

| Doc | Path |
|---|---|
| Collection registry | `docs/hadith/HADITH_COLLECTION_REGISTRY.md` |
| Completeness audit | `docs/hadith/HADITH_COMPLETENESS_AUDIT.md` |
| Source/license matrix | `docs/hadith/HADITH_SOURCE_LICENSE_MATRIX.md` |
| Source approvals | `docs/hadith/HADITH_SOURCE_APPROVALS.md` |
| Global search plan | `docs/remediation/HADITH_GLOBAL_SEARCH_PLAN.md` |
| View decomposition plan | `docs/remediation/HADITH_VIEW_DECOMPOSITION_PLAN.md` |

## Hadith follow-ups (queued)

1. Full Sahihayn search index + wire `/search`
2. HadithView decomposition
3. Owner-approved sunan local import (only after license row)
4. Optional: local Sahihayn tabs inside `/hadith/books` with numbering labels

## Explicit non-claims

- `HADITH_GLOBAL_SEARCH_COMPLETE` — not declared
- `HADITH_SECTION_COMPLETE` — not declared
- `SUNNAH_FULL_REMEDIATION_COMPLETE` — not declared
- Physical-device / Capacitor search validation — `DEVICE_REQUIRED`
