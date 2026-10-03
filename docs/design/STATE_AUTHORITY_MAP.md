# STATE_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `STATE_AUTHORITY_ONLY` |
| Alias of | `STATUS_AUTHORITY_MAP.md` + Feedback V2 |
| Façade | `design-system/StateSystem.tsx` |

Application states are **not** a second kit. STATE_AUTHORITY_ONLY = STATUS / Feedback V2 language.

## Approved

| State | Component |
|---|---|
| Loading | `LoadingStateV2` |
| Skeleton placeholders | page/route skeletons · `SkeletonCardGrid` (admin) — prefer LoadingStateV2 for full sections |
| Empty | `EmptyStateV2` |
| No results (search/filter) | `NoResultsState` |
| Error / retry | `ErrorStateV2` |
| Offline | `OfflineStateV2` |
| Stale | `StaleDataIndicator` |
| Unavailable / permission | `PermissionDeniedState` |
| Rate limit | `RateLimitedState` |

## Classification

| Surface | Class |
|---|---|
| Feedback V2 · StatusBadge · StatusCard | APPROVED |
| `mj` EmptyState compat | LEGACY (migrate to EmptyStateV2 when touched) |
| Page-local spinner / «لا يوجد» DIY | LEGACY |
| Mushaf loading chrome | SPECIAL_CASE |
| Admin SkeletonCardGrid | SPECIAL_CASE / admin façades OK |

## Contract

| Rule | Value |
|---|---|
| Structure | title · description · primary CTA · optional secondary |
| Actions | canonical `Button` |
| Empty ≠ NoResults | filter/search miss → NoResultsState |
| Offline ≠ Error | OfflineStateV2 |
| Wording | Arabic product copy · no raw API |

## Gates

`test:search-filter-state-authority` · `test:form-feedback-authority` · `test:overlay-feedback-authority`
