# RUNTIME_EXCELLENCE_BASELINE

**Phase:** `APPLICATION_EXPERIENCE_AND_RUNTIME_EXCELLENCE_PROGRAM`  
**Base tip:** `5d844807` (post Mushaf/App Performance Program)

## Inventory (repository proxies)

| Domain | Signal | Baseline |
|---|---|---|
| Mushaf fluidity | `estimatedTurnRenderHotspots` | 0 |
| Mushaf controls | inline handlers / weak-useCallback | high (excellence proxy) |
| Mushaf sheets | unstable props into memo menus | present |
| Route shells | `/mushaf` LRF | generic page skel (mismatch immersive) |
| Route shells | `/hadith` `/fiqh` LRF | generic page skel |
| Edge swipe | timeout cleanup | missing on unmount |
| Motion | route CSS durations | literal ms (not token-owned) |
| Mushaf nav band | opacity transition | 600ms in mushaf-reader.css |
| Startup sync CSS | count | 14 (locked) |
| Prefetch | single neighbor pipeline | true (#2523) |

## Classification

| Class | Items |
|---|---|
| FIXABLE_IN_REPOSITORY | Controls/sheet handler freeze · LRF mushaf/hadith/fiqh · EdgeSwipe timeouts · motion token wiring · nav-band duration |
| MUSHAF_SPECIAL | Product lock · settle 220ms · 3 QPC sheets |
| DEVICE_REQUIRED | FPS · long tasks · wall-clock |
| KEEP_JUSTIFIED | Sync CSS=14 · integrity gates · settle budget |

UNKNOWN_RUNTIME_DEBT = 0 for classified program surfaces.
