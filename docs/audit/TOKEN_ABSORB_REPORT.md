# TOKEN ABSORB REPORT — Debt Reduction Wave

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Branch | `cursor/debt-reduction-w1` |
| Tip base | `27ea9cf7` |
| Status | **COMPLETED** |

## Goal

Lower `mjDeclOutsideAllowlist` by absorbing `visual-identity-unify` / `sections-calm-polish` `--mj-*` declarations into allowlisted authority (`styles/theme-aliases.css`). No new token family. No budget raises.

## Measured

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| `mjDeclOutsideAllowlist` | 129 | **40** | **−89** (unify+calm+typography) |
| `mjDeclarations` | 241 | **218** | **−23** |
| `hexInCss` | 9142 | **9110** | **−32** |
| `rgbHslInCss` | 2228 | **2226** | **−2** |
| `cssFiles` | 360 | 360 | 0 |
| `!important` | 4798 | 4798 | 0 |

Ceilings lowered to match after measure (`visual-system-debt-budget.json`). No ceiling raised.

## Per-rule absorb table

| Consumer (was declaring) | Rule set | Authority replacement | Parity proof |
|---|---|---|---|
| `visual-identity-unify.css` `:root` | `--mj-bg`…`--mj-sh` Foundation bridge | `theme-aliases.css` `:root` absorb block | Gate: `sunnah-visual-identity-unify-gate` asserts aliases has `var(--sf-color-*)`; unify has **zero** `--mj-*: ` decls |
| `visual-identity-unify.css` dark | Night `--mj-*` palette | `theme-aliases.css` `html.dark` absorb block | Same values moved; consumer rules still `var(--mj-*)` / `--color-*` |
| `sections-calm-polish.css` `:root` | Competing hex `--mj-brand:#146b52` etc. | **Removed** (anti-authority) · Foundation via aliases | Gate forbids `#146b52` in unify/calm; calm now aliases only |
| `sections-calm-polish.css` chips | `--mj-chip-*` | `theme-aliases.css` chip tokens | Chip consumer rules in unify/calm unchanged (`var(--mj-chip-*)`) |
| `sections-calm-polish.css` dark | `--mj-*` rebind | Removed · night from aliases | Dark semantic `--background: var(--mj-bg)` only |

## Remaining outside allowlist (47)

`premium-dark-refine` 15 · `dark-design-system` 8 · `dark-mode-recovery` 7 · `typography-scale` 7 · `page-shell` 4 · `card-system-tokens` 2 · `native-feel` 2 · `thumb-zone` 1 · `interaction-states` 1 → Phase B / later absorb.

## Files changed

- `artifacts/majalis/src/styles/theme-aliases.css`
- `artifacts/majalis/src/styles/visual-identity-unify.css`
- `artifacts/majalis/src/styles/sections-calm-polish.css`
- `artifacts/majalis/src/lib/__tests__/sunnah-visual-identity-unify-gate.test.ts`
- `artifacts/majalis/reports/visual-system-debt-budget.json`
- `artifacts/majalis/reports/visual-system-baseline.json`

## Focused tests

- `sunnah-visual-identity-unify-gate.test.ts` — ok
- `visual-identity-unify-gate.test.ts` — ok
- `visual-system-inventory.mjs --check` — ok
