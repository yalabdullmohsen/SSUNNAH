# Mushaf Fluidity Optimization Report

| Field | Value |
|---|---|
| Branch | `cursor/mushaf-fluidity-optimization` |
| Base | latest `origin/main` @ program start |
| Scope | `docs/mushaf/MUSHAF_FLUIDITY_OPTIMIZATION_SCOPE.md` |
| WAVE6 | Not reopened — contracts remain PASS |
| Quran assets / mapping / 604 / 15-line | Untouched |

## STATUS

**Repository measured improvements shipped.**  
Wall-clock touch latency / FPS / long-tasks on physical devices = **DEVICE_REQUIRED**.

---

## PHASE 1 — Device Fluidity Audit (Top 10 delays)

Captured in `artifacts/majalis/reports/mushaf-fluidity-before.json` (static + hotspot model + font cache microbench).

| # | Delay ID | Severity (BEFORE) | Class |
|---|---|---:|---|
| 1 | PRODUCT_LOCK_FONT_LAYOUT | 10 | MUSHAF_SPECIAL |
| 2 | VISUAL_SETTLE_220MS | 9 | KEEP_JUSTIFIED |
| 3 | WORD_SYNC_FANOUT_X3_SHEETS | 9 | FIXABLE_IN_REPOSITORY → fixed |
| 4 | FONT_MISS_ON_TARGET | 8 | MUSHAF_SPECIAL |
| 5 | BIDIRECTIONAL_NEAR_PREFETCH_CONTENTION | 7 | FIXABLE_IN_REPOSITORY → fixed |
| 6 | DOM_WORDS_X3_COMPOSITE | 7 | MUSHAF_SPECIAL |
| 7 | CLEAR_CHROME_SETSTATE_STORM | 6 | FIXABLE_IN_REPOSITORY → fixed |
| 8 | DEVICE_MAIN_THREAD_UNKNOWN | 6 | DEVICE_REQUIRED |
| 9 | NEIGHBOR_EPOCH_RERENDER | 5 | FIXABLE_IN_REPOSITORY → fixed |
| 10 | SELECTION_GETCLIENTRECTS | 2 | PARTIAL (already frozen while turning) |

Telemetry gaps closed for future device runs: `pointerUp` · `visualTransitionEnd` · `productUnlock` · `pointerUpToVisualSettleMs` · `visualSettleToUnlockMs` · `renderCount`.

---

## PHASE 2–5 — Changes (evidence-backed only)

| Change | Why (from audit) | Files |
|---|---|---|
| `subscribeNoop` when `enabled=false` on word sync hooks | Adjacent/turning panes no longer re-render on ayah play/select/search | `mushaf-ayah-sync-store.ts` · `MushafVerseLayer.tsx` · `MushafPage.tsx` · `NewMushafReader.tsx` |
| `syncHighlights={pagerSettled && role==="current"}` | Freeze highlight subscriptions during turn + on neighbor sheets | `NewMushafReader` PrefetchPage |
| Opposite ±1 deferred to idle (`fluidity: opposite-near-idle`) | Preferred-direction ±1 eager; less font download contention | `NewMushafReader.tsx` |
| Remove `setNeighborEpoch` | Prefetch completion no longer forces full reader re-render | `NewMushafReader.tsx` |
| Guarded `clearPageChrome` (`needsClear`) | Skip multi-`setState` when chrome already idle | `NewMushafReader.tsx` |
| `onPanVisualStart` telemetry-only | Remove setState from touch→first translate path | `NewMushafReader.tsx` |
| Pager marks `pointerUp` / `visualTransitionEnd` / CSS `transitionStart` | Accurate unlock timeline | `useMushafPager.ts` · telemetry |
| `productUnlock` after unlock state apply | `commitToUnlockMs` measurable | `NewMushafReader.tsx` · telemetry |
| Arrows/Scrubber | Already independent of `neighborsReady` on main — verified CLOSED | — |

Not changed: page-turn phase machine ownership, SETTLE_MS=220, QPC assets, 3-sheet architecture.

---

## PHASE 6 — BEFORE / AFTER / DELTA

Source: `reports/mushaf-fluidity-before.json` · `reports/mushaf-fluidity-after.json` · `reports/mushaf-fluidity-delta.json`

| Metric | BEFORE | AFTER | DELTA |
|---|---:|---:|---|
| adjacentPaneSyncFrozen | false | true | improved |
| oppositeNearPrefetchOnIdle | false | true | improved |
| clearPageChromeGuarded | false | true | improved |
| neighborEpochRerender | true | false | improved |
| telemetryPointerUp | false | true | improved |
| telemetryVisualTransitionEnd | false | true | improved |
| telemetryProductUnlock | false | true | improved |
| arrowsWaitNeighborsReady | false | false | same (already closed) |
| scrubberWaitNeighborsReady | false | false | same |
| selectionFrozenWhileTurning | true | true | same |
| bookmarkMarkersFrozenWhileTurning | true | true | same |
| estimatedTurnRenderHotspots | **64** | **0** | **-64** |
| fontCacheHitSyncUsP50 | 0.006 | 0.006 | 0 (architecture) |

### Device wall-clock (not claimed)

| Metric | Status |
|---|---|
| touch → first translate (ms) | DEVICE_REQUIRED — enable `localStorage mushaf-turn-telemetry=1` |
| pointerup → visualTransitionEnd | DEVICE_REQUIRED |
| visualTransitionEnd → productUnlock | DEVICE_REQUIRED |
| font wait / layout wait | DEVICE_REQUIRED |
| React commit / long tasks / rejected gestures | DEVICE_REQUIRED |

---

## Residual delay classification

| Residual | Class | Note |
|---|---|---|
| CSS settle ~220ms | KEEP_JUSTIFIED | Paper ease; changing breaks feel/gates |
| Product lock until font+layout+displayView | MUSHAF_SPECIAL | Required for QPC correctness |
| Font miss on cold/jump pages | MUSHAF_SPECIAL | Prefetch helps sequential; jumps still wait |
| DOM words × 3 sheets composite cost | MUSHAF_SPECIAL | Architectural choice for interactive ayah |
| Main-thread jank on mid devices | DEVICE_REQUIRED | Needs Profiler / Slow Motion |
| Memory after 25/100 turns | DEVICE_REQUIRED | Unchanged measurement hold |

---

## Integrity

- No Quran text / mapping / 604 / geometry / QPC file edits
- WAVE6 gate contracts retained
- Gate: `pnpm --filter @workspace/majalis run test:mushaf-fluidity-optimization`
- Also wired into `test:mushaf-page-flip`

## IMPLEMENTATION_FROZEN

Yes — after product patches + audit artifacts + this report.
