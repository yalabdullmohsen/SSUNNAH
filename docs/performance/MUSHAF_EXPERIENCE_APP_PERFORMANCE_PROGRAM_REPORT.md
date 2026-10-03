# Mushaf Experience & Application Performance Program

**Branch:** `cursor/mushaf-experience-app-performance`  
**Base:** latest `main` after GLOBAL_COMPONENT_AUTHORITY_WAVE_1

## Changes (repository-safe)

### P1 Mushaf
- Single neighbor prefetch pipeline (direction-aware only; removed dual eager `prefetchMushafPage ±1/±2`)
- PrefetchPage shell ref guarded (`setShellEl` no-op when node unchanged)
- Stable `onBookmarkMarkerOpenCurrent` for `memo(PrefetchPage)`
- Reading coach short-circuits when locally dismissed

### P2 Startup
- Heavy identity / section chrome CSS deferred on `/mushaf` (interaction or long idle)
- Static Quranic font warm moved to idle after Mushaf route paint

### P3 Routes
- Prefetch prefix-chunk dedupe via `seen` (`chunk:${prefix}`)

### P5 State
- `migrateMushafUserData` session cache (page + reader dual call → one work unit)

### P6 Governance
- `docs/performance/APPLICATION_PERFORMANCE_BASELINE.md`
- Extended mushaf fluidity audit metrics
- `test:application-performance-program` in `test:ci-unit`

## Integrity

- No Quran text / mapping / 604 / 15-line changes
- No prayer / search ranking / SQL / store changes
- No debt ceiling raises

## Success flags

- MUSHAF_REPOSITORY_FLUIDITY_MAXIMIZED
- APPLICATION_STARTUP_IMPROVED
- ROUTE_LOADING_IMPROVED
- RENDER_CHURN_REDUCED
- STATE_ISOLATION_IMPROVED
- PERFORMANCE_GOVERNANCE_EXPANDED
- NO_QURAN_INTEGRITY_CHANGE
- NO_DEBT_CEILING_RAISE
- UNKNOWN_PERFORMANCE_DEBT = 0
