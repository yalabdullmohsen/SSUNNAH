# Final Internal Closure — PR1 Wave Report

| Field | Value |
|---|---|
| Branch | `cursor/final-internal-closure-pr1` |
| Baseline doc | `docs/audit/SUNNAH_FINAL_INTERNAL_CLOSURE_BASELINE.md` |
| Baseline tip | `dbb880426` (inventory captured 2026-09-29T18:10Z) |
| Parent `main` at branch | `be9e05cce` (Critical CSS 60KiB closure merged) |
| Program status (end PR1) | `WEB_RELEASED_NATIVE_HOLD` · `VISUAL_INTERACTION_PARTIAL` (Wave A only) |

## BEFORE

| Metric | Baseline (live) |
|---|---:|
| `/my-learning` route matrix | **PENDING** (critical gap) |
| Public native `<select>` files | **16** |
| Raw `<button>` files | **227** |
| Raw `<button>` elements | **978** |
| `div`/`span` onClick | **59** |
| Official `Button` import files | **137** |
| Interaction debt ceilings | rawButtonFiles **227**, rawButtonElements **978**, divSpanOnClick **59** |

## AFTER

| Metric | Post-PR1 (measured) |
|---|---:|
| `/my-learning` route matrix | **COMPLETE** (loading, empty, error, dark, rtl, accessibility, visualSystem) |
| Public native `<select>` files | **14** (−2 files; gate enforces ≤ 14, ceiling ≤ 16) |
| Raw `<button>` files | **225** (−2) |
| Raw `<button>` elements | **971** (−7) |
| `div`/`span` onClick | **59** (unchanged; Phase 4 classified, no net fix this PR) |
| Official `Button` import files | **139** (+2) |
| Interaction debt ceilings | **225** / **971** / **59** (lowered, not raised) |

## MY_LEARNING

- **View:** `artifacts/majalis/src/pages/lessons/ui/MyLearningView.tsx`
- **States:** skeleton loading (`aria-busy`), guest empty + login CTA, `ErrorState` with retry (`retryTick`), offline vs load error via `STATUS.networkError` / `STATUS.loadError`, keep-previous on catch.
- **RTL / dark:** `dir="rtl"`, route styles in `my-learning.css` under dark authority.
- **A11y:** `h1`/`h2`, progressbar semantics, labeled settings gear.
- **Matrix:** `docs/audit/ROUTE_QUALITY_MATRIX.json` — all fields **COMPLETE** with audit note.
- **Gate:** `my-learning-route-quality-gate.test.ts` (matrix + source contracts).

## PUBLIC_SELECTS

| Decision | Count (files) | PR1 action |
|---|---:|---|
| MIGRATE_NOW (done) | 2 | `SunnahChannelsPanel.tsx`, `QuranPeopleView.tsx` → Radix `Select` + `FieldLabel` |
| MIGRATE_NOW (deferred PR2+) | 6 | Circles, Memorization, Bookmarks, parts of Settings/notifications |
| JUSTIFIED / long list | 1 | `QuranWorshipHubView` (~114 surahs) |
| PRAYER_SPECIAL | 4 | Adhan / alert / voice selects — untouched |
| MUSHAF_SPECIAL | 4 | Mini-player, Hifz loop audio, Mushaf dock, Ayah sheet — untouched |
| BLOCKED | 0 | — |

Detail: `docs/design/PUBLIC_SELECT_FINALIZATION_REPORT.md`  
**Gate:** `public-select-pr1-gate.test.ts`

## RAW_BUTTONS

**Wave A (shared chrome only):**

| File | Change |
|---|---|
| `components/ui/AppBottomSheet.tsx` | Scrim + footer close → canonical `Button`; dismissible scrim `aria-label` |
| `components/ContentActions.tsx` | Stars, bookmark, report, chips, submit → `Button` + named rating group |

Already canonical (verified by gate, no raw `<button>`): `ui-common.tsx`, `ComingSoonDialog.tsx`.

**Gate:** `closure-pr1-interaction-wave-a-gate.test.ts` + `interaction-system-inventory.mjs --check`

## DIV_SPAN_ONCLICK

Phase 4 inventory (59 total) — **classification only this PR:**

| Class | Treatment PR1 |
|---|---|
| SHOULD_BE_BUTTON | Follow Wave B (page-level toolbars, cards) |
| SHOULD_BE_LINK | Follow Wave B where navigation intent |
| DRAG_HANDLE | Keep; keyboard on dedicated handles in later mushaf/UI waves |
| FALSE_POSITIVE | Sheet/dialog backdrops (`role="presentation"`, pointer capture) — no `role=button` patch |

No ceiling change; count remains **59**.

## TESTS

| Script | Scope |
|---|---|
| `pnpm run test:final-internal-closure-pr1` | my-learning matrix + public select + Wave A interaction |
| Wired in | `test:sunnah-ui-refinement` (CI interaction/visual refinement chain) |

Individual gates:

- `my-learning-route-quality-gate.test.ts`
- `public-select-pr1-gate.test.ts`
- `closure-pr1-interaction-wave-a-gate.test.ts`

## REGRESSIONS

- No prayer/adhan calculation or voice select changes.
- No admin native select migrations.
- No new token systems, `!important`, or raw color additions in touched files.
- Closed program items **not** reopened (Critical CSS, soft-cards, Nav×Prayer, etc.).

Verification run on branch (post-freeze): `verify:preflight`, `verify:ci`, `release:verify` — see CI / local logs at merge time.

## REMAINING_DEBT

| Area | Next wave |
|---|---|
| Public selects | 14 files — migrate low-risk; justify PRAYER/MUSHAF |
| Raw buttons | 225 files / 971 elements — Waves B–D (dialogs/sheets done in A for listed files) |
| div/span onClick | 59 — fix SHOULD_BE_* in shared lists after inventory slice |
| Route matrix | Other routes still PENDING; only `/my-learning` closed as critical P0 |
| Dark `--mj-*` absorb | Baseline program item — not PR1 |
| Legacy CSS retirement | Unchanged |

Sequential PRs per baseline manifest (PR2–PR8).
