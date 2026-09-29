# Critical CSS 60KiB — Closure Report

## STATUS

**COMPLETE** (gate PASS on clean production build) — `CRITICAL_CSS_CLOSED` pending `release:verify` on PR tip after merge.

## ROOT CAUSE

Critical `index-*.css` grew to **~61.8 KiB gzip** (budget **60 KiB**) mainly from sync `main.tsx` layers + large `index.css`, including:

1. `ssunnah-screen-patterns.css` in the critical entry despite Home/screens being lazy.
2. Residual `.soft-card` selector text in sync polish/unify/recovery after soft-card product retirement (TSX consumers = 0).

## BEFORE

| | |
|---|---|
| Tip | `10389211` (`origin/main` = production) |
| CSS file | `index-Byoj7yxl.css` |
| Raw | 338 428 |
| Gzip (level 9) | **61 820** (gate assert path ~61 904) |
| Budget | 61 440 |
| Overage | ~380–464 B |

## CHANGES

| File | Change | Reason | Risk |
|---|---|---|---|
| `main.tsx` | Remove sync import of `ssunnah-screen-patterns.css` | Not needed before lazy ScreenShell | Low — chrome unchanged |
| `ScreenShell.tsx` | Colocate `ssunnah-screen-patterns.css` | Ships with screen/route chunks | Low FOUC — page JS+CSS together |
| `ssunnah-screen-patterns-gate.test.ts` | Authority = ScreenShell; forbid sync main import | Keep enforcement | None |
| `visual-identity-unify.css` | Drop dead `.soft-card…` selector residue; keep live card classes | Dead class after retirement | Low |
| `sections-calm-polish.css` | Drop `.soft-card` from grouped selectors | Same | Low |
| `dark-mode-recovery.css` | Drop `.soft-card` / `--on-light` dark overrides | Same; keep mj/ss cards | Low |
| `ssunnah-ux-polish.css` | Drop `.soft-card` dark/active | Same | Low |
| `interaction-states.css` | Drop `.soft-card` from `:is(...)` lists | Same | Low |
| Docs | Root-cause + this report | Evidence | None |

## AFTER

| | |
|---|---|
| CSS file | `index-CaMgfCDS.css` |
| Raw | **335 366** (−3 062) |
| Gzip (level 9) | **61 127** (gate logged **61 201**) |
| Budget | 61 440 |
| Margin | **~239–313 B** under budget |
| Delta vs before | **≈ −693 B gzip** |
| Screen patterns chunk | `ssunnah-screen-patterns-*.css` (~2.4 KiB) separate |

Budget **not raised**. Measurement method unchanged (`gzipSync` level 9 on `index-*.css`).

## FOUC RESULTS

| Surface | Result |
|---|---|
| Home | PASS expected — patterns with Home/ScreenShell chunk |
| Search / Quran Hub / Lessons / Hadith | PASS expected — same |
| Prayer | Untouched prayer CSS/logic |
| Mushaf | Untouched glyph/mapping |
| Dark / System | dark-mode-recovery remains sync |
| RTL | Untouched |

Device confirmation remains DEVICE_REQUIRED.

## TESTS AND GATES

| Command | Result |
|---|---|
| Clean production build | PASS |
| `critical-css-gzip-gate` | **PASS** |
| `ssunnah-screen-patterns-gate` | PASS |
| `soft-cards-system-gate` | PASS |
| `visual-identity-unify-gate` | PASS |
| `sunnah-ui-refinement-gate` | PASS |
| `dark-mode-recovery-gate` | **FAIL Class B** — expects `--brand-on-surface` in `m2030/navigation.css`; missing on `origin/main` (not introduced by this diff) |

## PERFORMANCE

| Metric | After |
|---|---|
| Critical CSS gzip | ~61.1 KiB (under 60 KiB budget) |
| Sync screen-patterns | removed from critical |
| Deferred/chunk patterns | yes |

## REGRESSIONS

None observed in focused gates. No snapshot updates. No `!important` / raw color / token family additions.

## PR

(filled at delivery)

## PRODUCTION

(filled after deploy)

## FINAL STATE

Local gate: **PASS**. Declare `CRITICAL_CSS_CLOSED` only after `release:verify` PASS on merged tip.
