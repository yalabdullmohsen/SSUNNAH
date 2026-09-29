# PHASE 3 — Startup / Flicker / Chunk Recovery Status

| Field | Value |
|---|---|
| Tip | `ff77a662` + prior Interaction/Startup train |
| Product host | `www.ssunnah.com` |

## Closed in repository (FIXABLE done)

| Item | Evidence |
|---|---|
| Fullscreen «تحديث العرض» | Absent from `ErrorBoundary` path; gate `update-no-fullscreen-ui-gate` |
| Toast «جاري تحسين العرض…» | `ChunkRecoveryToast` returns `null`; recovery quiet |
| AppUpdateManager | `lib/app-update-manager.ts` — quiet states, no tech UI |
| Chunk recovery loop UX | Quiet purge; no auto reload storm UI |
| Prayer olive first paint | `prayer-route-shell.css` + `lrf-wrap--prayer` + #2306 lineage |
| Prayer boot skeleton | `pts-boot-hero` / `pts-boot-row` reserved geometry |
| Theme boot | Early `data-theme` / dark class in `index.html` + preference apply |
| Nav theme leak | #2351 `commitRouteSurface` sole owner |

## Remaining (honest)

| Item | Class |
|---|---|
| CLS numeric before/after on device | DEVICE_REQUIRED |
| Cold/Warm/Resume TestFlight matrix | DEVICE_REQUIRED |
| Home critical CSS identity under all SW states | PARTIAL — budget vs FOUC tradeoff |
| Prayer data tree when cache empty (city picker vs hero) | ACCEPTED_RISK / follow-up geometry parity |
| SW stale after large deploys | PARTIAL — quiet recovery; device confirm |

## Explicit non-claim

`SUNNAH_ZERO_FLICKER_AND_LAYOUT_SHIFT_COMPLETE` — **not** declared (device CLS open).
