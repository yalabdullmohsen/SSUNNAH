# SUNNAH WAVE6 — Mushaf Fluidity Closure Report

## STATUS

**COMPLETE** (repository + CI) · device evidence hold

Local gates: `verify:preflight` PASS · `verify:ci` PASS · `release:verify` PASS  
Decision after merge/deploy MATCH: `WAVE6_MERGED_AND_DEPLOYED_DEVICE_HOLD`

## LIVE BASELINE

See `docs/mushaf/WAVE6_MUSHAF_FLUIDITY_BASELINE.md`.  
Precondition: WAVE5 `03630aa8` MATCH production `version.json`.

## ARCHITECTURE

`NewMushafReader` → `MushafPager` (3 sheets, `translate3d` + rAF) → `MushafPage` / `MushafVerseLayer`.  
Dual locks documented in `mushaf-page-turn-phase.ts`:

- Visual: `useMushafPager.locking` (SETTLING)
- Product: `pageTurnLockRef` (COMMITTING / WAITING_FOR_FONT / WAITING_FOR_LAYOUT)

## PERFORMANCE TELEMETRY

- Flags: `mushaf-turn-telemetry` · `mushaf-experience-perf`
- Disabled by default (`enabled = false` until DEV / explicit localStorage)
- No `fetch` / beacon / PII / Quran text
- WAVE6 snapshot: `mushafWave6MetricsSnapshot()`
- Counters: rejectedGesture · selectionMeasure

## FONT PREFETCH

- Page face wait only (removed global `document.fonts.ready`)
- ±1 eager after current
- ±2 idle + generation cancel + queue cap 4
- Deduped via `loaded` + `inflight`
- Reader mirrors ±1 eager / ±2 idle for fonts + page JSON

## PAGE TURN STATE MACHINE

Phases: IDLE · DRAGGING · SETTLING · COMMITTING · WAITING_FOR_FONT · WAITING_FOR_LAYOUT · READY · RECOVERING  
Exposed as `data-page-turn-phase`.

## VISUAL LOCK

Ends on `transitionend` → `go(commit)`. Independent of product readiness.

## PRODUCT READINESS LOCK

Holds bottom freeze until font + layout + displayView.  
Safety timeout 2800 ms → RECOVERING → usable restore (no reload).  
One queued page intent after React reaches pending page.

## GESTURE RESPONSIVENESS

- rAF coalesce translate preserved
- Swipe-over-text enabled (removed `.nm-word` / ayah-hit from ignoreSelector)
- `panSlopFor(onAyah)` path live again
- Controls/sheets remain ignored
- Rejected gestures counted when visual lock blocks pointerdown

## RENDER SUBSCRIPTIONS

- Word-level boolean `useSyncExternalStore` retained (snapshot equality limits rerenders)
- Audio clock remains in `MediaBridge` + dock (not MushafPage)
- No audio progress subscription in word components

## ADJACENT PAGE RENDERING

Three sheets kept. Selection overlays only on settled current pane. ±2 deferred to idle.

## AUDIO ISOLATION

Unchanged contract: clock store isolated; snapshots update player state / ayah key only.

## SELECTION OVERLAY

Cache invalidate on container/enabled/resize/orientation — not every ayah key change.  
`selectionMeasure` counted on real `getClientRects` path.

## ROOT COMPONENT DECOMPOSITION

No large NewMushafReader split — extracted phase module + telemetry/font contracts only.

## PAINT AND CSS

No chrome paint rewrite in WAVE6 (avoid identity regression). Existing ultra-smooth compositing retained.

## MEMORY AND CLEANUP

- Prefetch generation bump on page change / unmount
- `mushafTurnResetSession` + safety timer clear on reader unmount
- Far prefetch queue bounded
- 25/100-turn heap: DEVICE_REQUIRED

## BEFORE VS AFTER

| Metric | Before | After | Notes |
|---|---|---|---|
| `document.fonts.ready` on page font | yes | no | page `fonts.load` only |
| ±2 font prefetch | sync with ±1 | idle + cap 4 | |
| swipe over text | ignored | armed via onAyah slop | |
| queued turn intent | none | max 1 | |
| selection cache clear on key change | yes | no | |
| telemetry WAVE6 keys | partial | yes | off by default |
| Quran text / mapping | — | unchanged | integrity gates |
| Device wall-clock | — | DEVICE_REQUIRED | |

## AUTOMATED MATRIX

Gate: `test:wave6-mushaf-fluidity` (+ wired into `test:mushaf-page-flip`).  
Phase resolver unit asserts in gate. Full viewport matrix via existing mushaf/page-flip suites.

## DEVICE REQUIRED MATRIX

`docs/mushaf/WAVE6_REAL_DEVICE_TEST_MATRIX.md` — all DEVICE_REQUIRED.

## INTEGRITY GATES

Must PASS: Quran checksum · 604 · page mapping · mushaf measurements · bookmarks · reading position · audio mapping.  
WAVE6 must not edit QPC assets / page JSON / checksum baselines.

## TESTS AND GATES

Focused: `pnpm --filter @workspace/majalis run test:wave6-mushaf-fluidity`  
Then: verify:preflight · verify:ci · release:verify · visual-snapshot · contrast · mushaf-page-flip.

## PR DELIVERY

Branch: `cursor/final-repo-closure-wave6`  
PR: https://github.com/yalabdullmohsen/majalis/pull/2383  
Merge squash: `b38e51775` on `main`  
Production `version.json`: `b38e5177` **MATCH**

## PRODUCTION SMOKE TESTS

All HTTP 200 (non-destructive): `/` · `/quran-hub` · `/mushaf` · `/mushaf/bookmarks` · `/search` · `/prayer-times` · `/api/healthz` · `/version.json`.

## REGRESSIONS

None known in-repo at patch time. Class B/C follow-ups only.

## ROLLBACK EVENTS

None.

## REMAINING MUSHAF DEBT

- Interactive word DOM × 3 sheets (`MUSHAF_HEAVY_BY_ARCHITECTURE`)
- Real-device FPS / memory / 100-turn proof
- Optional further verse-level subscription lift if Profiler shows cost

## NEXT WAVE READINESS

WAVE7 identity absorption only after WAVE6 merge + deploy + production MATCH + smoke PASS.

## FINAL DECISION

`WAVE6_MERGED_AND_DEPLOYED_DEVICE_HOLD` — after PR merge + Auto Deploy + production `version.json` MATCH tip.  
Real-device matrix remains DEVICE_REQUIRED (never DEVICE_TESTED / MUSHAF_SILKY without owner runs).
