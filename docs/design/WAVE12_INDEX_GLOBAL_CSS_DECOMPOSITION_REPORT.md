# WAVE12 — Index / Global CSS Decomposition

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Branch | `cursor/final-repo-closure-wave12` |
| Base | `origin/main` @ `12fba46c` (post-WAVE11) |
| Status | IMPLEMENTED (repo) — pending merge/deploy MATCH |

## Goal

Reduce `artifacts/majalis/src/index.css` without creating an aggregator replacement (`index-v2`, `final-final`, `global-new`, …). Move live route/component rules to **existing** ownership files; delete only **DEAD_PROVEN** selectors (consumer count = 0 in TSX/JS + no dynamic class builders).

## Scope Manifest

| Item | Detail |
|---|---|
| Target | Decompose critical `index.css` |
| Files touched | `index.css`, `badge-system.css`, `optimized-sheikh-image.css`, `tasbih.css`, `ulum-quran.css`, `index-deferred-pages.css`, `SurahStoriesView.tsx`, `wave5-critical-fouc-gate.test.ts`, this report |
| Tests | `wave5-critical-fouc-gate`, visual/interaction debt budgets, `verify:preflight` → `verify:ci` |
| Excluded | New CSS files · Quran/page-mapping · Prayer calc · Admin SQL · Budget raises · Snapshot auto-update |
| Acceptance | Line count ↓ · dead selectors gone · live ownership preserved · contrast/visual gates green · ceilings not raised |

## Before → After (index.css)

| Metric | Before | After |
|---:|---:|---:|
| Lines | **4308** | **3977** |
| Δ lines | — | **−331** (~7.7%) |

## Classification actions

### DEAD_PROVEN removed from `index.css`

| Selector family | Evidence |
|---|---|
| `.sheikh-series-grid/card` | No TSX/JS consumers |
| `.qibla-panel`, `.qibla-compass*`, `.qibla-meta/help` | Live Qibla uses `qibla.css` (`qibla-wrap`, `qibla-svg`, …) |
| `.quran-toolbar`, `.quran-search/.select`, `.quran-reader`, surah/trust/science/meta/error/ayah*` | No live className; search uses `quran-search-page*`; reader uses `quran-reader-page*` |
| `.radio-*` | No radio UI consumers (radiogroup false positives ignored) |
| `.nawawi-*` | Arbaeen uses `arbaeen-nawawi.css` / HDL — not these classes |
| `.occasions-list`, `.occasion-detail*` (dup) | Already owned by `pages/occasions.css` |
| `.share-btn*` | Share UI uses `share-faida*` |
| `.prophets-lux-tabs/tab*` (dup) | Owned by `pages/prophet-stories.css` (route-imported) |
| `.bottom-nav__prayer-float` | Only defined in index — no component |
| `.la-card` | No consumers (`mw-masala-card` false positive) |
| `.islamic-ornament-strip` | Docs-only mention |
| `.fatwa-card` (selector only) | Stripped from shared story/hadith/ruling rules |
| `.fawaid-card` (selector only) | Stripped from `.qa-card` transition rule |
| Optimized-sheikh duplicate keyframes/media | Owned by `components/optimized-sheikh-image.css` |

### LIVE moves (existing files only)

| Rule | Destination | Import |
|---|---|---|
| `.unsourced-badge` | `styles/components/badge-system.css` | Already deferred via `main.tsx` |
| `.optimized-sheikh-image--responsive` @768 (`7.75rem`) | `optimized-sheikh-image.css` | Component import |
| `.tasbih-page-card`, `.tasbih-phrase` + mobile layout | `pages/tasbih.css` | `TasbihView` |
| `.quran-source-note` | `pages/ulum-quran.css` | Added in `SurahStoriesView.tsx` |
| Fiqh mobile filter overrides | `index-deferred-pages.css` | Already deferred from `main.tsx` |

### KEEP in `index.css` (this wave)

| Area | Reason |
|---|---|
| `:root` / theme / typography / shell | Foundation / sync critical path |
| Home / navbar / assistant FAB | High-traffic shell |
| `.wird-card*` | Live `DailyWirdCard` / home LCP |
| Remaining mobile responsive system | Shared across routes; further splits = later batch |
| `.fiqh-council-subnav` (media) | Still referenced in responsive block — not proven dead this wave |

## Gates

- Extended `FORBIDDEN_IN_INDEX` in `wave5-critical-fouc-gate.test.ts` so WAVE12 removals cannot regress into critical CSS.
- No new CSS file → `cssFiles` ceiling unchanged policy satisfied.
- No new Design/Token/Card/Button system.
- No `!important` added; no new raw color families beyond token fallbacks on moved badge.

## Verification checklist

- [x] `wave5-critical-fouc-gate`
- [x] `test:visual-system-debt-budget`
- [x] `test:interaction-system-debt-budget`
- [x] `verify:preflight`
- [x] `verify:ci`
- [ ] production `version.json` MATCH after merge
- [ ] smoke routes HTTP 200

## Non-claims

- Does **not** claim `index.css` fully decomposed.
- Does **not** claim zero global CSS debt.
- Does **not** claim STORE GO / DEVICE_TESTED.

## Follow-ups (not this PR)

- Further home/navbar extraction batches with visual parity.
- Prove/delete remaining `fiqh-council-subnav` if unused.
- Larger `design-system.css` retirement remains SAFE_REMOVE_CANDIDATE per legacy matrix.

## Debt budgets (post-measurement)

| Metric | Pre-WAVE12 ceiling | Post measured | New ceiling |
|---|---:|---:|---:|
| hexInCss | 8978 | **8931** | 8931 |
| rgbHslInCss | 2129 | **2125** | 2125 |
| borderRadiusPxDecls | 1270 | **1265** | 1265 |
| buttonRelatedHexApprox | 1723 | **1709** | 1709 |
| cssFiles | 356 | 356 | 356 |
| mjDeclOutsideAllowlist | 0 | 0 | 0 |

Also absorbed redundant token hex fallbacks in remaining `index.css` rules (`--msk-text-2`, `--msk-border`, `--color-surface`) without behavior change when tokens are defined.

