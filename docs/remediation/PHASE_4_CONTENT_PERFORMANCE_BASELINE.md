# PHASE 4 — Content Delivery & Performance BASELINE

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/content-delivery-perf-p4` |
| Tip (Phase 3) | `3b5ef4ae6` |
| Worktree | `/Users/alabdullmohsen/wt-content-perf-p4` |

## Commands (measured — before code edits)

| Command | Result |
|---|---|
| `pnpm run typecheck` | **Pass** |
| `PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run build` | **Pass** · real **46.04s** · stamp `3b5ef4ae` |
| Prerender pages | **893** HTML |
| `pnpm run verify:preflight` | **Pass** (0.6s) |
| `pnpm run verify:ci` | Same tip passed in Phase 3 (**287.5s**); re-run after implementation |

## Bundle sizes (dist after strip:sourcemaps)

| Asset | raw bytes | gzip bytes |
|---|---:|---:|
| entry `index-DJYho8XJ.js` | 390 360 | 118 820 |
| `AppRoutes-Dahh0hLw.js` | 99 987 | ~24 210 (build log) |
| critical CSS `index-CtgE6UPg.css` | 336 385 | 61 866 |
| `fiqh-books-DJ4KTLRF.js` | **4 388 727** | **266 234** |
| `fawaid-curated-seed-*.js` | 492 406 | 70 799 |
| `prophetic-medicine-seed-*.js` | 488 874 | 94 222 |
| `fawaid-seed-*.js` | 358 300 | 63 876 |
| `adhkar-seed-*.js` | 162 523 | ~25 530 (build log) |
| `AdminV3App-*.js` | 58 183 | ~15 190 |
| search `index.json` (public) | 1 856 232 | — |
| search docs count | **4650** | schema version **3** |

### Largest 10 JS chunks (raw)

1. fiqh-books 4 388 727  
2. tarikh-islami 575 292  
3. fawaid-curated-seed 492 406  
4. prophetic-medicine-seed 488 874  
5. researches service 410 718  
6. entry index 390 360  
7. fawaid-seed 358 300  
8. supabase 207 452  
9. IslamicGlossaryPage 188 408  
10. nations 184 094  

## Giant modules inventory (code-backed)

| Path | bytes | prod graph | domain | notes |
|---|---:|---|---|---|
| `content/fiqh/books.json` | 5 433 089 | **Yes** via static import in `fiqh-books.ts` | fiqh | Dominates fiqh chunk |
| `src/lib/prophetic-medicine-seed.ts` | 533 421 | Yes | medicine | page-local chunk |
| `src/lib/fawaid-curated-seed.ts` | 504 525 | Yes | fawaid | offline bootstrap slice |
| `src/lib/fawaid-seed.ts` | 400 543 | Yes | fawaid | also dynamic from app-search |
| `src/lib/verified-hadith-fill*.ts` | Σ 1 482 778 | **No** (dead) | hadith | runtime uses `public/data/hadith-verified/` |
| `src/lib/researches/published-seed-fill*.ts` | Σ 513 605 | Yes | researches | demo-seed chain |
| `src/lib/adhkar-seed.ts` | 194 351 | Yes | adhkar | search generator + offline |
| `public/data/search/index.json` | 1 856 232 | Yes (fetch) | search | worker + cache |
| `src/AppRoutes.tsx` | 796 lines | Yes | routing | monolith lazy table |

## Library decision evidence

- `/library` → `/search` in AppRoutes + vercel.json (intentional: `LIBRARY_ROUTE_INTENT.md`)
- Public verified sources: **18 / 190** (`library-public-source-gate`)
- Decision baseline: **REDIRECT_RETAINED / BLOCKED_SOURCE** until verified corpus grows

## Critical findings

1. `fiqh-books.ts` static-imports 5.4 MB JSON → 4.3 MB JS chunk.
2. Fawaid/prophetic/adhkar seeds still emit dedicated JS chunks.
3. Hadith fill TS is dead weight on disk (not in graph).
4. Search index is single 1.8 MB JSON (already lazy via worker) — not in entry.
5. AppRoutes ~100 KB gzipped ~24 KB — modularization for maintainability + future split.
6. Admin CSS/JS already separate chunks (AdminPage CSS 126 KB not in entry).

## Constraints

- No mushaf/adhan/SQL/Capacitor signing changes.
- No religious text mutation; parity + checksum required for migrations.
- No push / merge / deploy.

## AFTER (same machine, post Phase-4 implementation)

| Asset | before raw | after raw | delta |
|---|---:|---:|---:|
| `fiqh-books-*.js` | 4 388 727 | **8 080** | **−99.8%** |
| entry `index-*.js` | 390 360 | 390 360 | ~0 |
| `AppRoutes-*.js` | 99 987 | 99 893 | ~0 (lazy defs moved; route table retained) |
| critical CSS | 336 385 | 336 385 | 0 |
| search `index.json` | 1 856 232 | 1 856 232 | 0 (+ **30 shards** + manifest) |
| vite `built in` | (within ~46s full build) | **11.57s** vite step | — |
| prerender HTML | 893 | 893 | 0 |
| bundle-budget | soft | **hard: fiqh ≤400KiB, no JS >2MiB** | pass |

Public fiqh mirror: `public/data/fiqh/{books,book-aliases,manifest}.json` (checksum parity with `content/fiqh`).
