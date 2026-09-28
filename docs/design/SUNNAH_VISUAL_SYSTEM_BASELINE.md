# سُنّة — Visual System Baseline (PR-1)

| Field | Value |
|---|---|
| Measured | 2026-09-28T20:11:35.524Z |
| Scope | `artifacts/majalis/src` |
| Tool | `artifacts/majalis/scripts/visual-system-inventory.mjs` |
| Machine JSON | `artifacts/majalis/reports/visual-system-baseline.json` |
| Debt budget | `artifacts/majalis/reports/visual-system-debt-budget.json` |
| Visual change in this PR | **none** |
| Screenshots matrix (all viewports × light/dark/RTL/large-text) | **NOT_RUN** this wave — tooling capture deferred; code metrics frozen below |
| Decision context | `WEB_RELEASED_NATIVE_HOLD` · store **HOLD** |

> أرقام فعلية فقط من تشغيل السكربت. لا تقديرات.

## 1) Volume

| Metric | Value |
|---|---:|
| CSS files | 361 |
| TSX files | 820 |
| Approx. CSS rule blocks `{` | 20 959 |
| Sync CSS imports in `main.tsx` | 23 |
| Deferred CSS imports in `main.tsx` | 59 |

## 2) Debt ceilings (frozen — must not rise)

| Metric | Ceiling |
|---|---:|
| `!important` | 4 799 |
| Hex in CSS | 9 164 |
| `rgb()` / `hsl()` in CSS | 2 228 |
| `--mj-*` declarations (all) | 241 |
| `--mj-*` declarations outside allowlist | 129 |
| `box-shadow` declarations | 1 147 |
| Raw `z-index: <number>` | 276 |
| `border-radius` with px literals | 1 330 |
| Inline color/background `style={{…}}` matches | 89 |
| Files containing raw `<button` | 356 |

## 3) Token adoption (floors — must not fall)

| Metric | Floor |
|---|---:|
| `--sf-*` references | 670 |
| `--ss-*` references | 721 |
| Files importing official `Button` | 5 |

## 4) Token declaration counts

| Prefix | Declarations | Notes |
|---|---:|---|
| `--sf-*` | 150 | Canonical foundation (`sunnah-foundation-tokens.css`) |
| `--ss-*` | 99 | Product consumption bridge (`ssunnah-theme-api.css`) |
| `--mj-*` | 241 | Compatibility / legacy theme (`theme.css` + others) |

## 5) Classification seed (files / layers)

| Layer / path | Class |
|---|---|
| `styles/sunnah-foundation-tokens.css` | **CANONICAL** |
| `styles/ssunnah-theme-api.css` | **CANONICAL** (consumption API; values via aliases) |
| `styles/sunnah-foundation-v2.css` | **CANONICAL** (semantic roles over `--sf-*`) |
| `app/styles/theme.css` (`--mj-*`) | **COMPATIBILITY** |
| `styles/brand-v4.css` + `tokens.css` | **ACTIVE_LEGACY** |
| `styles/m2030/*` | **ACTIVE_LEGACY** |
| `styles/final-release.css` | **ACTIVE_LEGACY** |
| `styles/visual-identity-unify.css` | **OVERRIDE_PATCH** / ACTIVE_LEGACY |
| `styles/sections-calm-polish.css` | **OVERRIDE_PATCH** |
| `styles/dark-mode-recovery.css` · `premium-dark-refine.css` · `luxury-night-*` | **ACTIVE_LEGACY** (dark) |
| `styles/pages/*-legacy.css` | **MIGRATION_CANDIDATE** |
| `styles/soft-cards.css` | **MIGRATION_CANDIDATE** |
| `features/mushaf-*/*.css` | **BLOCKED** for general waves (Phase 11 only) |
| `admin-v3` CSS | **ROUTE_SPECIFIC** / BLOCKED delete until Admin migration |
| Orphan `search-legacy.css` (if zero import) | **SAFE_REMOVE_CANDIDATE** (verify before delete) |

Full living matrix: `docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md`.

## 6) Authority pointer

See `docs/design/DESIGN_TOKEN_AUTHORITY.md`.

## 7) Gate

```bash
pnpm --filter @workspace/majalis run test:visual-system-debt-budget
```

Policy: **decreasing ceilings** · floors for canonical adoption · no raise without documented exception.
