# WAVE5 — Critical CSS / FOUC / Theme Flash Baseline

**Captured:** 2026-09-30  
**Tip:** `origin/main` @ `24b513cab` (WAVE4 seal)  
**Worktree:** `/tmp/majlis-final-closure-wave5` · branch `cursor/final-repo-closure-wave5`  
**Method:** clean `vite build` + `gzipSync(level=9)` on largest `dist/assets/index-*.css`  
**Budget:** **61 440** B (60 KiB) — **not raised**

## Production gate (pre-WAVE5)

| Check | Result |
|---|---|
| WAVE2/3/4 | MERGED_AND_DEPLOYED |
| `www.ssunnah.com/version.json` | `24b513ca` **MATCH** `origin/main` |
| Debt budgets | Held (visual cssFiles≤356 · interaction rawButtonFiles≤192) |

## Live Critical CSS (pre-change)

| Metric | Value |
|---|---:|
| File | `index-BRKcArup.css` |
| Raw | **328 406** B |
| Gzip (L9) | **60 125** B |
| Brotli (informational) | **49 275** B |
| Budget | **61 440** B |
| Margin | **1 315** B |

## Import graph (main.tsx)

| Metric | Value |
|---|---:|
| Sync CSS imports | **22** |
| Deferred CSS imports (call sites) | **53** |
| Unique deferred | **50** |
| Sync∩Deferred (reload-to-win) | `visual-identity-unify` · `dark-mode-recovery` · `interaction-states` |
| Multi-deferred (boot dark + idle) | `dark-mode-surfaces` · `dark-design-system` · `premium-dark-refine` |

## Initial JS (largest entry chunks, gzip L9)

| File | Gzip |
|---|---:|
| `index-UxIUKiTC.js` | ~121 980 |
| `index-U4xdz4Pm.js` | ~17 316 |

## Runtime contracts already on tip (pre-WAVE5)

| Area | State |
|---|---|
| ChunkRecoveryToast | `return null` (no technical toast) |
| chunk-recovery | quiet purge · no auto reload loop |
| route-surface | commit on App layout only · prefetch loads assets only |
| Prayer countdown live text | isolated span consumer |
| Home CLS structural gate | `cls-home-gate` present |

## DEVICE_REQUIRED (not claimed)

Cold/warm FCP/LCP/CLS on physical devices · System theme matrix · offline SW on device · TestFlight.

## Notes

Historical docs citing ~60 125 gzip match this live tip. Margin remains tight (~1.3 KiB) — WAVE5 target is a **wider** margin without raising budget or changing measurement.
