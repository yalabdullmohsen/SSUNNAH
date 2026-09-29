# سُنّة — Debt Reduction Wave Report

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Branch | `cursor/debt-reduction-w1` |
| Base tip | `27ea9cf7` |
| Closed PRs (do not reopen) | #2350 · #2351 · #2352 · #2353 |
| Store / native | **WEB_RELEASED_NATIVE_HOLD** |
| Visual interaction | **VISUAL_INTERACTION_PARTIAL** |
| Forbidden | New Design/Token/Card/Button systems · budget raises · `!important` adds · new hex families · Quran/mapping · STORE GO |

## Phase results

| Phase | Deliverable | Result |
|---|---|---|
| A Token absorb | `TOKEN_ABSORB_REPORT.md` | **COMPLETED** |
| B Dark bridge | `DARK_BRIDGE_REDUCTION_REPORT.md` | **IMPROVED** |
| C Button debt | `BUTTON_DEBT_PROGRESS.md` | **IMPROVED** |
| D Public forms | `FORM_PORT_MATRIX.md` | **IMPROVED** |
| E Soft cards | `SOFT_CARD_RETIREMENT_REPORT.md` + inventory | **IMPROVED** |
| F App page / Utility | `PAGE_CONTRACT_PROGRESS.md` | **COMPLETED** |
| G Mushaf UI | `MUSHAF_UI_REPORT.md` | **UNCHANGED** |
| H Legacy delete | `LEGACY_CSS_RETIREMENT_MATRIX.md` updated | **IMPROVED** (no mass delete) |
| I Route matrix | `ROUTE_QUALITY_MATRIX.json` critical closure | **IMPROVED** |
| J Final inventory | below | **COMPLETED** |

## Final inventory (measured, not estimated)

| Metric | Before (wave start / tip baseline) | After | Δ |
|---|---:|---:|---:|
| UtilityScreen product consumers | 9 | **5** | **−4** |
| Soft-card tsx refs | 56 | **54** | **−2** |
| Raw button files | 265 | **230** | **−35** |
| Raw button elements | 1027 | **992** | **−35** |
| Native `<select` files | 68 | **67** | **−1** |
| `mjDeclOutsideAllowlist` | 129 | **40** | **−89** |
| CSS files | 360 | **360** | 0 |
| `!important` | 4798 | **4798** | 0 |
| Hex in CSS | 9142 | **9110** | **−32** |

Ceilings lowered to match. No ceiling raised. No new systems.

## Live status (single label)

**WEB_RELEASED_NATIVE_HOLD** · **VISUAL_INTERACTION_PARTIAL**

(Not STORE GO. Not VISUAL_INTERACTION_COMPLETE_WEB — soft-cards/dark bridges/button debt remain.)

## Verify

| Gate | Result |
|---|---|
| Focused (unify · utility · debt budgets · a11y-contrast · settings) | **PASS** |
| `pnpm run verify:preflight` | **PASS** |
| `pnpm run verify:ci --force` | **PASS** |
| `pnpm run release:verify` | **PASS** (45/45; STORE HOLD) |
| `version.json` ↔ main | post-merge deploy |

Note: `api/healthz.js` shim restored for phase7-backward-compat (was missing on main — Class B unlock for release:verify).

## Follow-ups (not this PR)

1. Dark bridge import removal after per-file parity.
2. Soft-card consumer → 0 then drop CSS import (no CardV3).
3. Continue button/forms public ports; lower ceilings.
4. Remaining `mj-outside` dark/premium decls absorb.
