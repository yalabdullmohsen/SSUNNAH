# APPLICATION_PERFORMANCE_BASELINE

**Phase:** `MUSHAF_EXPERIENCE_AND_APPLICATION_PERFORMANCE_PROGRAM`  
**Captured from:** `origin/main` @ program start (`26b11a75`) · live audit wave

## Scope

Repository-measurable proxies for Mushaf fluidity, startup CSS/JS work, route warm, render churn, and state isolation.  
Device FPS / long-tasks remain **DEVICE_REQUIRED**.

## Mushaf (fluidity audit AFTER wave)

| Metric | Baseline (pre-wave tip) | Target |
|---|---|---|
| `estimatedTurnRenderHotspots` | 0 (WAVE6/fluidity) | stay **0** |
| `verseWordSyncSubscriptionsPerWord` | 0 | 0 |
| `adjacentPaneSyncFrozen` | true | true |
| `oppositeNearPrefetchOnIdle` | true | true |
| `neighborEpochRerender` | false | false |
| Dual eager `prefetchMushafPage ±1/±2` | present (duplicate pipeline) | **removed** |
| Prefetch shell `setShellEl` guard | absent | **present** |
| Stable `onBookmarkMarkerOpen` | inline | **useCallback** |
| Reading coach after dismiss | timer/effect still armed | **alreadyDone short-circuit** |

## Startup

| Signal | Notes |
|---|---|
| Sync CSS in `main.tsx` | Locked at **14** (U8) — do not raise |
| Heavy identity CSS | Home deferred; **Mushaf now deferred** (interaction / long idle) |
| `ChunkRecoveryToast` | Mounts `null` — KEEP_JUSTIFIED (gates) |

## Routes

| Signal | Notes |
|---|---|
| `prefetchRoute` once-set | Path-level `seen` + prefix chunk dedupe |
| Mushaf route chunk | Soft budget unchanged — no ceiling raise |
| `warmStaticQuranicFonts` | Idle after Mushaf paint (not race with QPC) |

## State

| Signal | Notes |
|---|---|
| `migrateMushafUserData` | Session cache — page+reader dual call → one work unit |
| Ayah sync store | Noop on non-current / turning panes (unchanged contract) |

## Governance

- Gate: `test:application-performance-program`
- Mushaf fluidity: `test:mushaf-fluidity-optimization` (extended metrics)
- Excellence engine: `test:performance-excellence` (ceilings held)

## Classification

| Class | Items |
|---|---|
| FIXABLE_IN_REPOSITORY | Dual neighbor prefetch · shell ref churn · bookmark handler · coach dismiss · Mushaf heavy CSS · font warm race · migrate double-work · prefix prefetch storms |
| MUSHAF_SPECIAL | Product lock font+layout · 3 QPC sheets · 220ms settle |
| DEVICE_REQUIRED | FPS · long tasks · wall-clock turn latency |
| KEEP_JUSTIFIED | Settle budget · integrity/mapping gates · sync CSS count |

UNKNOWN_PERFORMANCE_DEBT = 0 for classified program surfaces.
