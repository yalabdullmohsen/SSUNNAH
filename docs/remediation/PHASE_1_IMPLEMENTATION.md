# PHASE 1 Implementation — Startup / Chunk / Mushaf / Persistence

Branch: `cursor/startup-mushaf-persistence-p1`  
Date: 2026-09-28

## Scope delivered

| Phase | Status | Notes |
|---|---|---|
| 0 Baseline | Done | `docs/remediation/PHASE_1_BASELINE.md` |
| 1 Chunk recovery | Done | build-id keyed allowance · clear on INTERACTIVE · failure meta · tests |
| 2 Startup/splash | Done | single controller kept · splash clear reasons telemetred · duplicate CSS boot import removed |
| 3 Live mushaf graph | Done | shared TS under `features/mushaf-shared` · madinah re-exports · live static imports → shared |
| 4 Persistence | Done | repository + prefer-native resolve + versioned migration |
| 5 CSS | Partial | classification doc · duplicate interaction-states removed · madinah.css extract **BLOCKED** |
| 6 Observability | Done | `lib/ops-telemetry.ts` local ring |
| 7 Verification | Done | `verify:preflight` + `verify:ci` **pass** (288.5s) |

## Post-change bundle (measured after verify:ci build)

| Asset | Raw | gzip-9 |
|---|---:|---:|
| Entry JS `index-C2AWwZtz.js` | 390360 | 118592 |
| Main CSS `index-CtgE6UPg.css` | 336385 | 61281 |
| Mushaf route JS `MushafReaderPage-NcZbU8aG.js` | 82718 | 26238 |
| Mushaf route CSS `MushafReaderPage-DWppp7Yy.css` | 166607 | 26820 |
| AppRoutes JS | 99751 | 23914 |

## BLOCKED (evidence)

1. **Full removal of `mushaf-madinah.css` from `/mushaf`** — live DOM still uses `mm-*` classes; extract shell CSS first.
2. **Device LCP/TBT / WebView persistence** — not measured on hardware in this run.
3. **Destructive khatma JSON merge** (`mj-quran-khatmah-v1` ↔ `majalis-khatmah-tracker-v1`) — shapes differ; migration notes conflict only.

## Experimental routes (documented, not deleted)

- `/quran-engine` remains independent of `/mushaf`.
- `VerifiedMushafReader` / `mushaf-madinah` kept (archived live path).

## Key files

- `src/lib/lazy-with-retry.ts`, `src/lib/chunk-recovery.ts`, `src/lib/ops-telemetry.ts`
- `src/lib/mushaf-persistence/**`
- `src/features/mushaf-shared/**`
- `src/lib/native-storage.ts` (prefer-native for mushaf keys)
- `src/lib/app-shell-stability.ts`, `src/lib/splash-screen.ts`
