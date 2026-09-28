# Mushaf Real Device Release Matrix — Phase 6

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/release-rc-stabilization-p6` |
| Policy | Simulator ≠ real device. Untested = **DEVICE_REQUIRED**. |

## Automated (repository / CI)

| Check | Status |
|---|---|
| Mushaf unit gates in `verify:ci` | PASS when CI green |
| Page mapping / checksum gates (existing) | PASS when CI green |
| Live graph exclusions (archived CSS) | PASS when related gates green |
| Religious text mutation | NOT_APPLICABLE (forbidden) |

## Device matrix

| Device class | Portrait | Landscape | Light | Dark | Large text | Offline | Low storage | Audio interrupt | Background/resume | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| iPhone small (SE-class) | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| iPhone modern | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| iPhone large | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| iPad | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| Android small | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| Android modern | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| Android tablet | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |

## Journeys (each device)

Cold open `/mushaf` · last page restore · first/last page · repeated navigation · bookmarks add/delete · guest→login · offline · cloud sync fail · appearance/dark · search · tafsir · audio download/cancel/fail · storage full · cache clear · deep link · long session.

Evidence required: dated notes + build id + short video or screenshots (no real user data).
