# PHASE 1 BASELINE — Startup / Chunk / Mushaf / Persistence

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/startup-mushaf-persistence-p1` |
| Tip | `d4c04b270` (`origin/main`) |
| Worktree | linked worktree (not nav-prayer WIP) |
| Product | `artifacts/majalis` |

## Commands run

```bash
CI=true pnpm install --frozen-lockfile --prefer-offline
PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run build
```

Build: **Pass** · `builtAt` `2026-09-28T11:12:09.804Z` · `version.json` commit `d4c04b27`

## Bundle sizes (dist, measured)

| Asset | Raw bytes | gzip (compresslevel=9) |
|---|---:|---:|
| Entry JS `index-DCc_qjl2.js` | 386210 | 117186 |
| Main CSS `index-CtgE6UPg.css` | 336385 | 61281 |
| Mushaf route `MushafReaderPage-BBkHq3E2.js` | 82667 | 26212 |
| AppRoutes `AppRoutes-BvMURoFG.js` | 99711 | 23843 |

Build also reported CSS budget gate: `index-CtgE6UPg.css = 336385` (≤ 505000). Soft chunk warning: `fiqh-books-eeR_4eBL.js` 4.3MB raw / 262KB gzip.

## /mushaf import graph (pre-change, ripgrep)

Live mount: `MushafReaderPage` → `NewMushafReader`.

Direct imports from `features/mushaf-madinah` into live reader:

- `mushaf-audio-clock-store`
- `mushaf-ayah-sync-store`
- `mushaf-page-for-ayah`
- `useQpcPageFont`
- `useMushafResourceGate`
- `layout-bands`
- static CSS: `mushaf-madinah.css`
- lazy: `MushafTafsirSheet`, `MushafSearchSheet`, `prefetch-adjacent-audio`

Live reader DOM still uses `mm-*` classes (`mm-page-shell`, `mm-pager-*`, `mm-viewport`) → **full removal of `mushaf-madinah.css` from `/mushaf` is BLOCKED until shell CSS is extracted** (would break layout).

## Chunk recovery (pre-change behavior)

| Property | Observed |
|---|---|
| Auto `location.reload` | **No** (`tryRecoverFromStaleChunk`) |
| Fullscreen «تحديث العرض» | **Absent** from ErrorBoundary / chunk-recovery |
| Allowance key | `sessionStorage` `majalis-chunk-reload` (label only, **not** build-id keyed) |
| Max quiet attempts | 1 per tab session |
| User hard recover | `hardRecoverStaleDeploy()` → purge shell + reload |
| Existing tests | `chunk-recovery.test.ts`, `lazy-with-retry.test.ts`, update-* gates |

## Startup (pre-change)

- Mount-first: `createRoot` before Preferences await — confirmed in `main.tsx` / `native-storage.ts` comments.
- Dual splash: Capacitor hide-immediate + `#mj-launch-splash` ≤1400ms.
- `AppStartupController` states present.
- `hydrateNativeStorage`: **empty-only** Preferences→LS merge.
- `IdleRuntimeBoot` delayed 10s after `load`.

## Persistence (pre-change)

- Last page / bookmarks write via `native-storage` sync helpers.
- Duplicate façades still exist: `src/quran/services/storageService.ts` vs `lib/quran-storage-service.ts`.
- Dexie engine DB separate from live mushaf LS SoT.

## Pre-existing failures

None asserted in this baseline for typecheck/build of tip `d4c04b270` — production build exited 0. Device LCP/TBT: **NOT MEASURED**.
