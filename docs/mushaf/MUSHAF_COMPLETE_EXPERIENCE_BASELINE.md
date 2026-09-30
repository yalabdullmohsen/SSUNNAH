# Mushaf Complete Experience Baseline

| Field | Value |
|---|---|
| Tip | `ada1f8af` (pre-FINAL-1) |
| Method | Live code + gates + production smoke — not invented FPS |

## Entry

| Flow | Observed (repo) | Gap |
|---|---|---|
| First `/mushaf` | Restores last page via storage; font wait page-only | Coach missing → FINAL-1 |
| Cached reopen | Prefetch ±1 / idle ±2 | Direction bias → FINAL-1 |
| Deep link page | clamp 1…604 | COMPLETE |
| Route return | reading position keys live | DEVICE_REQUIRED cold/warm |

## Page turn

| Flow | Observed | Gap |
|---|---|---|
| Swipe over text | panSlopFor(onAyah) · ignoreSelector excludes words | COMPLETE (WAVE6) |
| Arrows / scrubber | live | DEVICE feel |
| Page 1 / 604 | clamp + pager resistance | edge tests FINAL-1 |
| Rapid / queued | intent max 1 · safety 2800ms RECOVERING | COMPLETE |

## Tools

| Tool | Baseline | Next |
|---|---|---|
| Chrome toggle | tap empty | COMPLETE |
| Search / Tafsir | sheets | ENHANCE-3 polish |
| Bookmarks / notes | VV shell | FINAL-1 focus first field |
| Audio / Mini player | dock isolated from text paints | ENHANCE-4 |
| Appearance | GOLD/EMERALD + app theme boundary | ENHANCE-5 |

## Metrics (instrumented, telemetry off by default)

Keys: `touchToFirstTranslateMs` · `rejectedGestureCount` · `selectionMeasureCount` · font wait · cache hit/miss  
Device FPS / 100-turn heap: **DEVICE_REQUIRED**

## After FINAL-1 targets

- Coach present once · dismissible · accessible
- Prefetch prefers last turn direction
- Integrity freeze gate green
- WAVE6 gate green on tip
