# MUSHAF_WAVE6_REPORT — Internal Closure Final

| Field | Value |
|-------|-------|
| Status | `MUSHAF_WAVE6_FINAL_REPO_COMPLETE` · DEVICE_HOLD |
| Date UTC | 2026-10-03 |
| Tip | `cursor/sunnah-internal-closure-final` |
| Gate | `test:mushaf-fluidity-optimization` PASS |

## Quantified bottlenecks (after this wave)

| ID | Severity | Class | Status |
|----|----------|-------|--------|
| PRODUCT_LOCK_FONT_LAYOUT | 10 | MUSHAF_SPECIAL | KEEP_JUSTIFIED — integrity of page commit |
| VISUAL_SETTLE_220MS | 9 | KEEP_JUSTIFIED | CSS settle matches layout-bands |
| FONT_MISS_ON_TARGET | 8 | MUSHAF_SPECIAL | QPC face load required |
| DOM_WORDS_X3_COMPOSITE | 7 | MUSHAF_SPECIAL | 3-sheet pager architecture |
| DEVICE_MAIN_THREAD_UNKNOWN | 6 | EXTERNAL_BLOCKER | DEVICE_REQUIRED |
| WORD_SYNC_FANOUT | 2 | FIXED | line-level `useMushafHighlightKeys` |
| SELECTION_GETCLIENTRECTS | 1 | FIXED→PARTIAL | `useMushafOverlayKeys` + band dedupe |
| BIDIRECTIONAL_NEAR_PREFETCH | 3 | FIXED | opposite idle |
| CLEAR_CHROME / NEIGHBOR_EPOCH | ≤2 | FIXED | prior WAVE6 |

## Fixes this wave

1. **Overlay subscription isolation** — `AyahSelectionOverlay` uses single `useMushafOverlayKeys(enabled)` instead of 3 hooks.
2. **Selection measure dedupe** — skip `setState` when cached band arrays unchanged (audio repeat same ayah).
3. **Line highlight path** — preserved from radical closure (`useMushafHighlightKeys` in VerseLayer).
4. **Audio coupling** — overlay no longer independently subscribes to playing/selected/nav keys.

## Preserved

Quran text · ayah/page mapping · QPC SoT · 604 pages — **untouched**.

## Metrics

| Metric | Before (program) | After |
|--------|------------------|-------|
| estimatedTurnRenderHotspots | 64 | **0** |
| VerseLayer per-word sync hooks | 3 | **0** |
| Overlay store subscriptions | 3 | **1** |

## Exit

```text
MUSHAF_WAVE6_FINAL_REPO_COMPLETE
REMAINING = MUSHAF_SPECIAL | DEVICE_REQUIRED | KEEP_JUSTIFIED only
```
