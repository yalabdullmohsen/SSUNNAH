# PHASE 5 — Design / UX / Accessibility BASELINE

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/design-ux-a11y-p5` |
| Tip (Phase 4) | `b64319d06` |
| Worktree | `/Users/alabdullmohsen/wt-design-ux-p5` |

## Inventory (measured — source scan, Python, same machine)

Scope: `artifacts/majalis/src` (`.css` + `.ts`/`.tsx` as noted).

| Metric | Count / value |
|---|---:|
| CSS files under `src/styles` (+nested) | **347** (layer scan) / **361** (`src/**/*.css`) |
| TS/TSX files under `src` | **2589** |
| Unique hex colors (`#RGB`/`#RRGGBB`/α) | **1618** |
| Unique CSS custom properties | **3327** |
| `--sf-*` (excl. sf2) | **120** |
| `--sf2-*` | **74** |
| `--ss-*` | **76** |
| `!important` occurrences (css+ts) | **4847** |
| Approx. CSS rules (`{` count in CSS) | **20951** |
| CSS source bytes | **3 876 226** |
| Unique `border-radius` values | **359** |
| Unique `box-shadow` values | **608** |
| Unique `font-family` declarations | **110** |
| Unique `font-size` declarations | **548** |
| Unique `font-weight` declarations | **60** |
| Unique `z-index` value strings | **91** |
| Unique `@media` queries | **83** |
| JSX `style={{` inline usages | **416** |
| Hardcoded `dir` / `direction` matches | **358** |
| Component stems with Button/Empty/Error/Load/Nav/Dialog/Drawer/Sheet | 12 / 3 / 3 / 6 / 9 / 4 / 4 / 8 |

### Top `z-index` literals (frequency)

`1`(59), `2`(33), `0`(19), `5`(14), `40`(13), `200`(9), `60`(8), `10`(8), `80`(7), `30`(7), `20`(5), `9999`(5), `10010`(5)

### Pattern classification (examples)

| Pattern | Class |
|---|---|
| `--sf-*` / `--sf2-*` / `--z-*` / `--motion-*` | CANONICAL |
| Duplicate card/button variants across folders | DUPLICATED / MIGRATION_CANDIDATE |
| brand-v4 / final-release / m2030 | LEGACY_REQUIRED |
| design-system.css large overlap | SAFE_REMOVE_CANDIDATE (no delete) |
| Touch &lt; 44px static findings | See `docs/qa/interaction-touch-under44-static.json` — ACCESSIBILITY_RISK |
| Mushaf / Admin CSS | ROUTE_SPECIFIC / BLOCKED for global delete |
| Conflicting dark remaps | VISUAL_CONFLICT / COMPATIBILITY |

## Commands (measured on this branch)

| Command | Result | Notes |
|---|---|---|
| Inventory script | **Pass** | Numbers above |
| `node --import tsx …/phase5-design-ux-gate.test.ts` | **Pass** | Wired into `test:typography-readable` |
| `ssunnah-screen-patterns-gate` + consolidation gate | **Pass** | |
| `pnpm run typecheck` | **Pass** | ~28s |
| `pnpm run verify:ios-edge` | **Pass** | PageContainer uses `var(--inset-*)` |
| `pnpm run verify:orphan-discovery` | **Pass** | `/dev/*` skipped |
| `PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run build` | **Pass** | vite **11.40s**; prerender 893 |
| Bundle budget gates | **Pass** | entry gzip 116.5 KiB ≤ 120 |
| `pnpm run verify:preflight` | **Pass** | 0.6s |
| `pnpm run verify:ci` | **Pass** | **284.4s** |

## BEFORE bundle reference (Phase 4 tip `b64319d06` after P4)

From `PHASE_4_CONTENT_PERFORMANCE_BASELINE.md` AFTER table (same tip lineage):

| Asset | raw bytes |
|---|---:|
| entry `index-*.js` | 390 360 |
| critical CSS `index-*.css` | 336 385 |
| `AppRoutes-*.js` | ~99 893 |
| `fiqh-books-*.js` | 8 080 |

## Phase 5 code deltas (implementation)

| Change | Purpose |
|---|---|
| `OfflineStateV2` + ScreenShell offline | Unified offline state |
| `PageContainer` + CSS | Public layout + safe area + bottom nav |
| `z-index-layers.css` / `motion-policy.css` | Token authority |
| DEV `/dev/design-system` (lazy, DEV-only) | Component gallery |
| Error/Empty V2 headings + correlationId | A11y / ops |
| Docs + `phase5-design-ux-gate` | Authority + measurement |

## AFTER (production build on this branch — measured)

| Asset | before raw (P4) | after raw (P5) | delta |
|---|---:|---:|---:|
| critical CSS `index-CTtqHtHH.css` | 336 385 | **336 465** | **+80** |
| critical CSS gzip | ≤61 440 | **61 411** | pass (≤60KiB target) |
| entry `index-kwnvylfs.js` | 390 360 | **390 790** | **+430** |
| `AppRoutes-*.js` | ~99 893 | **100 958** | **+1 065** |
| `DesignSystemGalleryPage-*.js` | n/a | async stub (~942B) | not in entry; `/dev` path stripped in prod |
| UI fonts `public/fonts/ui` total | — | **577 380** | Amiri primary + optional |
| vite `built in` | — | **12.08s** | |
| prerender HTML | 893 | **893** | 0 |

Notes: `z-index-layers.css` + `motion-policy.css` load via `loadNonCriticalCss` (deferred) to protect critical CSS gzip. Content widths live in `sunnah-foundation-tokens.css`.

LCP/CLS: not re-measured with Lighthouse in this phase (no local LHCI run claimed). Use DEVICE_REQUIRED / CI LHCI for field numbers.

## Constraints honored

- No merge / push / deploy
- No mushaf page-map / adhan / religious text edits
- No Framer Motion / new UI library
- Legacy CSS not deleted
- No formal WCAG certification claim
- Real devices marked DEVICE_REQUIRED in `docs/qa/PHASE_5_REAL_DEVICE_MATRIX.md`
