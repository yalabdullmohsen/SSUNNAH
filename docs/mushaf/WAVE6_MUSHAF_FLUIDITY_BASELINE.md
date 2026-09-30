# WAVE6 — Mushaf Fluidity Baseline

**Date:** 2026-09-30  
**Base tip:** `03630aa8` (WAVE5 MERGED_AND_DEPLOYED · production MATCH)  
**Live path:** `/mushaf` → `MushafReaderPage` → `NewMushafReader` → `MushafPager` → `MushafPage` / `MushafVerseLayer`

## Gate precondition

| Check | Evidence |
|---|---|
| WAVE5 on origin/main | `03630aa8` |
| production `version.json` | `commitSha: 03630aa8` MATCH |
| Critical CSS gzip | WAVE5: 57 171 ≤ 61 440 (margin 4 269) |
| Rollback | none active |

## Architecture snapshot (code-live)

| Layer | Role | Lock / cost |
|---|---|---|
| `useMushafPager` | Visual pan via `translate3d` + rAF coalesce | `locking` until `transitionend` → `go` |
| `NewMushafReader.pageTurnLockRef` | Product readiness (font + layout + displayView) | Safety timeout 2800 ms |
| `ensureQpcPageFont` / `useQpcPageFont` | Per-page QPC WOFF2 · module `loaded` + `inflight` dedupe | Pre-WAVE6: ±1/±2 sync + `document.fonts.ready` |
| Three sheets | next · current · prev | Recycle after page commit |
| `mushaf-ayah-sync-store` | selected/playing/search/nav | Word-level `useSyncExternalStore` boolean snapshots |
| `mushaf-audio-clock-store` | playback time | Isolated in `MediaBridge` + AudioDock (not MushafPage) |
| `AyahSelectionOverlay` | band rects via `getClientRects` | Cleared cache on every key change (pre-WAVE6) |
| Telemetry | `mushaf-turn-telemetry` · `mushaf-experience-perf` | Disabled unless DEV / explicit localStorage |

## Proven bottlenecks (pre-patch)

1. **Font readiness gate:** `waitUntilReady` awaited global `document.fonts.ready` (all faces), not page face only.  
2. **Prefetch:** ±2 started eagerly with ±1 (competes; no idle/cancel/queue cap in font hook).  
3. **Dual locks:** visual settle ends at `transitionend`; product lock holds gestures/arrows until font+layout (`finishPageTurn`). No single queued intent.  
4. **Swipe-over-text blocked:** `NewMushafReader` `ignoreSelector` included `.nm-word` / ayah hits — pager never armed on ink (dead `onAyah` slop path).  
5. **Selection:** `clearTextMeasureCache()` on every selected/playing/nav key change → extra `getClientRects` storms.  
6. **DOM:** interactive words × 3 sheets remains `MUSHAF_HEAVY_BY_ARCHITECTURE` (not removed).

## Automated baseline (repo tools)

| Metric | Pre-WAVE6 status |
|---|---|
| touch→first translate | Instrumentable via `mushafTurnMark` (DEV) — DEVICE_REQUIRED for wall-clock |
| totalTurn / commitToUnlock | Same — DEVICE_REQUIRED |
| rejected gestures | Not counted (added in WAVE6 telemetry) |
| getClientRects / selectionMeasure | Not counted (added) |
| font cache hit/miss | Session counters exist when telemetry on |
| React render counts | Lifetime `mushafPerfInc` exists; device Profiler DEVICE_REQUIRED |
| 25 / 100 turns memory | DEVICE_REQUIRED / harness NOT MEASURED |
| Quran checksum / 604 / mapping | Must remain PASS (integrity unchanged) |

## Matrix environments (automated where available)

Viewports: 320×568 · 390×844 · tablet · desktop · RTL · Light/Dark · reduced-motion.  
Modes: no audio · playing · selected · search · cached/uncached fonts (unit/gate).  
Real devices: see `WAVE6_REAL_DEVICE_TEST_MATRIX.md` — all DEVICE_REQUIRED until owner run.

## Integrity freeze

No change to Quran text, tashkeel, ayah numbers, 604 pages, 15-line geometry, page mapping, QPC font files, or checksum baselines.
