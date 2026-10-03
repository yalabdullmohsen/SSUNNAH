# MUSHAF_BOTTLENECK_REPORT

Generated: 2026-10-03T04:37:16.362Z

Policy: **No speculative fixes — numbers first.**

## Static aggregates

| Signal | Count |
|---|---:|
| useEffect | 78 |
| useState | 71 |
| setInterval | 0 |
| addEventListener | 25 |
| subscribe | 2 |
| requestAnimationFrame | 15 |
| ResizeObserver | 4 |
| MutationObserver | 0 |

## Ranked bottleneck proxies

1. `features/mushaf-reader/NewMushafReader.tsx` weight=48 · useEffect×18, listeners×2, rAF×2
2. `features/mushaf-madinah/VerifiedMushafReader.tsx` weight=43 · useEffect×17, listeners×1, rAF×2
3. `features/mushaf-reader/useMushafPager.ts` weight=26 · useEffect×3, listeners×4, rAF×1, observers×1
4. `features/mushaf-reader/MushafControlsLayer.tsx` weight=21 · useEffect×6, listeners×2, rAF×1
5. `features/mushaf-bookmarks/MushafBookmarkEditorShell.tsx` weight=19 · useEffect×2, listeners×3, rAF×2
6. `features/mushaf-madinah/MushafAyahHighlight.tsx` weight=17 · listeners×3, rAF×1, observers×1
7. `pages/quran/MushafReaderPage.tsx` weight=16 · useEffect×8
8. `features/mushaf-madinah/useMushafPageFontFit.ts` weight=14 · listeners×2, rAF×1, observers×1

## Measured / documented

| Item | Value |
|---|---|
| pageTurnLatencyMs | NOT_MEASURED_THIS_RUN — use mushaf-turn-telemetry (DEVICE_REQUIRED) |
| layoutCost | See docs/mushaf/MUSHAF_INTERNAL_PERFORMANCE_BASELINE.md (geometry prior measure) |
| fontLoading | QPC pack gates — see test:qpc-font-pack |
| domNodeCount | NOT_MEASURED_THIS_RUN |
| subscriptions | 2 |
| selectionRendering | AyahSelectionOverlay / highlight modules — profile DEVICE_REQUIRED |
| routeChunkGzipKiB_documented | 24.51 |
| routeChunkSource | docs/mushaf/MUSHAF_INTERNAL_PERFORMANCE_BASELINE.md (commit ead50727) |
| softCeilingGzipKiB | 40 |

Evidence: `docs/mushaf/MUSHAF_INTERNAL_PERFORMANCE_BASELINE.md` · turn telemetry.
