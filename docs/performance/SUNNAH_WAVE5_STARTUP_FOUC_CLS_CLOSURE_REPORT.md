# SUNNAH WAVE5 — Startup / FOUC / CLS Closure Report

## STATUS

**COMPLETE** (pending merge/deploy seal → then `WAVE5_MERGED_AND_DEPLOYED`)

## LIVE BASELINE

| Metric | Pre-WAVE5 (`24b513cab`) | After WAVE5 patches |
|---|---:|---:|
| Critical file | `index-BRKcArup.css` | `index-ZphkCCU5.css` |
| Raw | 328 406 | 311 081 |
| Gzip L9 | **60 125** | **57 171** |
| Brotli (info) | 49 275 | ~46.9 KiB era |
| Budget | 61 440 | 61 440 (**unchanged**) |
| Margin | **1 315** | **4 269** |
| Sync imports | 22 | 22 |
| Deferred call sites | 53 | 53 |
| cssFiles | 356 | 356 |
| important | 4788 | 4787 |
| hexInCss | 9026 | 8988 |
| rgbHslInCss | 2149 | 2129 |

Method unchanged: `gzipSync(level=9)` on largest `dist/assets/index-*.css`.

## ROOT CAUSES

1. Critical `index.css` still carried DEAD_PROVEN legacy home/prayer/notif/tabs chrome → tight gzip margin.  
2. Intentional sync∩deferred cascade reimports (`unify` / `dark-mode-recovery` / `interaction-states`) remain required after `final-release` (not removable without identity flash).  
3. Theme boot / quiet chunk recovery / route-surface prefetch contracts were already largely closed on WAVE4 tip — WAVE5 hardens with gates.

## CSS IMPORT GRAPH

See `docs/performance/WAVE5_CSS_IMPORT_GRAPH.md`.

## DUPLICATION REMOVED

- Dead CSS rules removed from sync `index.css` (~21 KB raw / ~−2.9 KiB gzip on critical bundle).  
- Orphan `prayer-status-grid` media rules removed from `kuwait-lessons.css`.  
- Sync∩deferred allowlist frozen (3 files only) — accidental new dups fail `wave5-critical-fouc-gate`.

## THEME BOOT

`mj-theme-boot` in `index.html` sets `data-theme` / classes / theme-color before paint; `theme-preference.ts` shares `majalis-theme` key. Dark elevated boot tokens injected when resolved=dark. Gate asserts key parity.

## SHELL GEOMETRY

Unchanged contract: CSS variables in critical inline + sync layers; `cls-home-gate` / LazyRouteFallback prayer shell retained.

## HOME CLS

Structural gates held (`HomeRestShell`, hero min-heights, font-display optional). No hero geometry rewrite in WAVE5.

## PRAYER FIRST ENTRY

Countdown text isolated (`memo` span). Fallback `lrf-wrap--prayer` geometry unchanged. **No** prayer calculation / Adhan / location logic changes.

## NAVIGATION LATENCY

Prefetch prayer assets only (`prefetchPrayerRouteAssets`) — gate asserts no DOM/theme mutation.

## CHUNK RECOVERY

Quiet purge · single allowance · `ChunkRecoveryToast` → `null` · no technical phrases (existing `update-no-fullscreen-ui-gate`).

## SERVICE WORKER

Unchanged quiet update path (`mj:sw-updated-quiet`); no second SW.

## FONT AND IMAGE STABILITY

No QPC font changes. UI fonts remain `font-display: optional` (cls-home-gate).

## CRITICAL CSS BEFORE VS AFTER

| | Before | After | Delta |
|---|---:|---:|---:|
| Gzip | 60125 | 57171 | **−2954** |
| Margin | 1315 | 4269 | **+2954** |
| Budget raised? | no | no | — |

## PERFORMANCE BEFORE VS AFTER

| Metric | Before | After | Note |
|---|---|---|---|
| Critical gzip | 60125 | 57171 | improved |
| Initial JS largest | ~122 KB gz | unchanged class | no intentional JS growth |
| FCP/LCP/CLS device | DEVICE_REQUIRED | DEVICE_REQUIRED | not claimed |

## VISUAL MATRIX

Automated: gates + verify:ci visual-snapshot (no auto snapshot update). Device matrix = DEVICE_REQUIRED.

## ACCESSIBILITY

No contrast budget raise; contrast gates run in CI. No new `!important` / raw color families.

## TESTS AND GATES

- `wave5-critical-fouc-gate.test.ts` (wired into `test:nav-active`)  
- `critical-css-gzip-gate`  
- `cls-home-gate`  
- `test:visual-system-debt-budget` (ceilings lowered)  
- verify:preflight / verify:ci / release:verify — see Delivery

## PR DELIVERY

Branch `cursor/final-repo-closure-wave5` → PR title `perf(startup): close critical CSS, FOUC and route-entry regressions`

## PRODUCTION SMOKE TESTS

After merge + Auto Deploy + version.json MATCH.

## REGRESSIONS

None intended. Quran text / page mapping / Prayer calc untouched.

## ROLLBACK EVENTS

None.

## DEVICE_REQUIRED

Physical cold/warm FCP·LCP·CLS · System theme matrix · offline SW on device · TestFlight.

## EXCLUSIONS

WAVE6 Mushaf · Admin migration · broad Button/Legacy retirement · SQL/RLS · secrets.

## REMAINING PERFORMANCE DEBT

- ALLOWED_CASCADE_REIMPORT after `final-release` (reload-to-win) until final-release conflicts absorbed.  
- Large deferred CSS graph (53).  
- DEVICE_REQUIRED measurements.

## NEXT WAVE READINESS

WAVE6 only after `WAVE5_MERGED_AND_DEPLOYED` + production MATCH + smoke PASS.

## FINAL DECISION

**WAVE5_COMPLETE** (local closure). Seal **WAVE5_MERGED_AND_DEPLOYED** after production MATCH.
