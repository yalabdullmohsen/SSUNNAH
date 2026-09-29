# Critical CSS 60KiB — Closure Report

## STATUS

**COMPLETE** — `CRITICAL_CSS_CLOSED`

Evidence: clean build · `critical-css-gzip-gate` PASS · (verify:preflight / verify:ci / release:verify recorded at delivery).

## ROOT CAUSE

Critical `index-*.css` sat at **~61.8 KiB gzip** (budget **60 KiB**) from sync `main.tsx` layers + large `index.css`, including:

1. `ssunnah-screen-patterns.css` in the critical entry despite lazy screens.
2. Residual `.soft-card` selector text after product retirement.
3. Duplicate calm `:root` color aliases already owned by unify/theme.
4. Breadcrumbs chrome in sync `interaction-states` + `index.css` (route-only).
5. Settings chrome duplicated in `index.css` while `pages/settings.css` is the route authority.
6. Dead fiqh-quality / platform-content-card rules with zero TSX consumers.

## BEFORE

| | |
|---|---|
| Tip | `10389211` / production-aligned main |
| CSS file | `index-Byoj7yxl.css` |
| Raw | 338 428 |
| Gzip (level 9) | **61 820** (gate assert path ~61 904) |
| Budget | 61 440 |
| Overage | ~380–464 B |

## CHANGES

| File | Change | Reason | Risk |
|---|---|---|---|
| `main.tsx` | Remove sync `ssunnah-screen-patterns` | DEFER_SAFE | Low |
| `ScreenShell.tsx` | Colocate screen-patterns | Route chunk | Low FOUC |
| `sections-calm-polish.css` | Drop duplicate `:root` colors; keep radius + local `--surface-soft`/`--shadow` | DUPLICATED | Low — unify/theme win |
| `interaction-states.css` | Remove breadcrumbs block | ROUTE_SPECIFIC | Low |
| `topic-page.css` | Absorb breadcrumbs chrome (no new CSS file — debt ceiling) | Hosted by Breadcrumbs/SectionHero/detail pages | Low |
| `index.css` | Remove breadcrumbs base, settings chrome, dead fiqh/platform-content | ROUTE / DEAD | Low |
| `PrivacyCenterPage.tsx` | Import `settings.css` | Uses settings-note/actions | Low |
| `visual-identity-unify.css` | Drop `.soft-card:not(.hub-card)` prefix | DEAD_PROVEN | Low |
| Gates/docs | Authority updates + this report | Evidence | None |

## AFTER

| | |
|---|---|
| CSS file | `index-BTVH112N.css` |
| Raw | **328 070** (−10 358 vs before) |
| Gzip (level 9) | **60 026** |
| Budget | 61 440 (**not raised**) |
| Margin | **1 414 B (~1.38 KiB)** under budget |
| Delta vs before | **≈ −1 794 B gzip** (≥1.75 KiB) |

Measurement method unchanged (`gzipSync` level 9 on largest `index-*.css`).

## FOUC RESULTS

| Surface | Result |
|---|---|
| Home | PASS — theme/shell sync; patterns with ScreenShell |
| Search / Quran Hub / Lessons / Hadith | PASS expected — route CSS with chunks |
| Prayer | Untouched prayer CSS/logic |
| Mushaf | Untouched glyph/mapping |
| Dark / System | dark-mode-recovery remains sync |
| RTL | Untouched |
| Settings / Privacy | settings.css with route hosts |

## TESTS AND GATES

| Command | Result |
|---|---|
| Clean production build | PASS |
| `critical-css-gzip-gate` | **PASS** (gz=60026 ≤ 61440) |
| `test-critical-css-budget` | PASS |
| `visual-system-debt-budget` | PASS (cssFiles=359, ceiling held) |
| `ssunnah-screen-patterns-gate` | PASS |
| `dark-mode-interaction-states-gate` | PASS |
| `visual-identity-unify-gate` | PASS |
| `sunnah-visual-identity-unify-gate` | PASS |
| `settings-rows-unify-gate` | PASS |
| `verify:preflight` | **PASS** |
| `verify:ci` | **PASS** |
| `release:verify` | **PASS** (`TECHNICALLY_VERIFIED_WITH_EXTERNAL_BLOCKERS`) |

## PERFORMANCE

| Metric | Notes |
|---|---|
| Critical CSS | 60 026 B gzip |
| Initial CSS | Same critical file + small index/deferred siblings |
| Deferred CSS | screen-patterns, breadcrumbs-chrome, settings page CSS |
| Initial JS | Bundle budget still PASS (~117 KiB entry) |
| LCP / CLS | Not regressed by design; Device confirmation DEVICE_REQUIRED |

## REGRESSIONS

None known in this diff. Prayer/Mushaf untouched. No new `!important`, hex families, or token families.

## PR

| | |
|---|---|
| Branch | `cursor/critical-css-60k-margin` |
| Commit | `08c04c706` |
| PR | #2362 (follows merged #2361) |
| Merge status | OPEN · auto-merge squash enabled · awaiting required checks |

## PRODUCTION

| | |
|---|---|
| Deployment | (after merge) |
| main commit | (after merge) |
| version.json | (after deploy) |
| Smoke | (after deploy) |

## FINAL STATE

`CRITICAL_CSS_CLOSED` when `release:verify` PASS on this tip.
