# STATUS_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `STATUS_AUTHORITY_ONLY` |

## Approved state components

| State | Component |
|---|---|
| Loading | `LoadingStateV2` |
| Empty | `EmptyStateV2` |
| No results | `NoResultsState` |
| Error | `ErrorStateV2` |
| Offline | `OfflineStateV2` |
| Stale | `StaleDataIndicator` |
| Permission denied | `PermissionDeniedState` |
| Rate limited | `RateLimitedState` |
| Inline status | `StatusCard` |
| Success / warn chips | `StatusBadge` (tones) |

## Classification

| Surface | Class |
|---|---|
| Feedback V2 + StatusBadge + StatusCard | APPROVED |
| AdminV3* thin wrappers over Feedback V2 | APPROVED (façade) |
| Page-local “لا يوجد” / spinner DIY | LEGACY |
| Mushaf loading chrome | SPECIAL_CASE |

## Contract

| Rule | Value |
|---|---|
| Empty ≠ NoResults | filters/search miss → NoResultsState |
| Offline ≠ Error | show OfflineStateV2 + cache when available |
| Actions | canonical `Button` retry / home / clear filters |
| Structure | title · description · primary action · optional secondary |
| Colors / icons | semantic · no page hex status kits |
| Wording | Arabic product copy only |

## Gates

`test:form-feedback-authority` · `test:overlay-feedback-authority`
