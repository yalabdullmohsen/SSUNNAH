# MUSHAF_WAVE6_REPORT — Fluidity Radical Closure

| Field | Value |
|-------|-------|
| Status | `MUSHAF_WAVE6_COMPLETE` (repository) · `DEVICE_HOLD` |
| Date UTC | 2026-10-03 |
| Tip base | `a8067f664` + radical-closure delta |
| Authority | `docs/mushaf/MUSHAF_FLUIDITY_IMPLEMENTATION_PLAN.md` |
| Gate | `test:mushaf-fluidity-optimization` PASS |

## Diagnosis (unchanged class)

`MUSHAF_HEAVY_BY_ARCHITECTURE` — three interactive QPC sheets, product+visual dual lock, font readiness, selection measure.

## Quantified bottleneck inventory

| ID | Severity (after) | Class | Evidence |
|----|------------------|-------|----------|
| PRODUCT_LOCK_FONT_LAYOUT | 10 | MUSHAF_SPECIAL | finishPageTurn waits font+layout+displayView |
| VISUAL_SETTLE_220MS | 9 | KEEP_JUSTIFIED | SETTLE_MS=220 before go() |
| FONT_MISS_ON_TARGET | 8 | MUSHAF_SPECIAL | ensureQpcPageFont on cache miss |
| DOM_WORDS_X3_COMPOSITE | 7 | MUSHAF_SPECIAL | three QPC sheets during pan |
| DEVICE_MAIN_THREAD_UNKNOWN | 6 | DEVICE_REQUIRED | FPS/long-tasks not in CI |
| WORD_SYNC_FANOUT | **2** (was 9/4) | PARTIAL | line-level `useMushafHighlightKeys` |
| BIDIRECTIONAL_NEAR_PREFETCH | 3 | FIXABLE→done | opposite ±1 idle |
| CLEAR_CHROME_SETSTATE | 2 | FIXABLE→done | needsClear guard |
| SELECTION_GETCLIENTRECTS | 2 | PARTIAL | frozen while turning |
| NEIGHBOR_EPOCH_RERENDER | 1 | FIXABLE→done | removed |

## Safe rendering optimizations (this wave)

1. **Subscription reduction** — `MushafVerseLayer` / `MushafBasmalaView` subscribe once via `useMushafHighlightKeys(syncHighlights)` instead of 3×N per-word hooks.
2. **Stable snapshot cache** — `getHighlightKeysSnapshot()` returns referentially stable object when keys unchanged (rAF-friendly emit path retained).
3. **Lock simplification** — adjacent/turning panes keep `syncHighlights={pagerSettled && role === "current"}` → `subscribeNoop`.
4. **Font readiness** — opposite-near idle prefetch + direction-aware ±1/±2 (prior WAVE6; preserved).
5. **Gate update** — fluidity optimization gate asserts line-level hooks; forbids per-word hooks in VerseLayer.

## Non-goals preserved

- Quran text / page mapping / ayah mapping / line layout / QPC SoT / 604 pages — **untouched**.

## Measurable before/after

| Metric | BEFORE | AFTER | Delta |
|--------|--------|-------|-------|
| `estimatedTurnRenderHotspots` | 64 | 0 | −64 |
| `verseWordSyncSubscriptionsPerWord` (VerseLayer) | 3 | 0 | −3 |
| Line-level highlight subscribe | no | yes | improved |
| `adjacentPaneSyncFrozen` | true | true | same |
| `oppositeNearPrefetchOnIdle` | true | true | same |
| `clearPageChromeGuarded` | true | true | same |
| `neighborEpochRerender` | false | false | same |
| Telemetry pointerUp / visual / unlock | true | true | same |

Artifacts: `artifacts/majalis/reports/mushaf-fluidity-{before,after,delta}.json`

## Exit

```text
MUSHAF_WAVE6_COMPLETE
REPOSITORY_FIXABLE_FLUIDITY_REDUCED
DEVICE_FPS_EVIDENCE = DEVICE_REQUIRED
QURAN_CONTENT_UNCHANGED = true
```
