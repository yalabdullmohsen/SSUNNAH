# Final Internal Closure — PR2 Wave Report

| Field | Value |
|---|---|
| Branch | `cursor/final-internal-closure-pr2` |
| Focus | Dark Token Absorb + Dark Bridge Reduction |
| Parent `main` | tip at branch cut (Critical CSS + Closure PR1) |
| Out of scope | Legacy CSS Retirement · Mushaf UI Wave · Floating Layer Wave · reopening closed programs |

## BEFORE

| Metric | Baseline |
|---|---:|
| `mjDeclOutsideAllowlist` | **30** |
| Outside files | `premium-dark-refine.css` (15) · `dark-design-system.css` (8) · `dark-mode-recovery.css` (7) |
| `theme-aliases` night `--mj-bg` | Competing `#121816` (≠ product `#0F1613`) |
| Dark bridge class (Wave 3) | ACTIVE remaps of `--mj-*` in three sheets |
| Visual ceilings | `mjDeclOutsideAllowlist` ≤ 30 · `mjDeclarations` ≤ 215 · `hexInCss` ≤ 9103 · `rgbHslInCss` ≤ 2217 |

### Inventory table (Phase 1 — all 30)

| File | Selector | Token | Winning value (cascade) | Consumer / route | Absorb target |
|---|---|---|---|---|---|
| premium-dark-refine | `:is(html[data-theme=dark], html.dark)` | `--mj-brand-deep-ink` | `var(--pd-ink)` → `#ede8df` | brand text on cards · global | theme.css + aliases |
| premium-dark-refine | same | `--mj-brand-deep-surface` | `#0e1c17` | deep brand surfaces | theme.css + aliases |
| premium-dark-refine | same | `--mj-brand-deep` | `var(--elite-forest,#8fd4b0)` | links / chips night | theme.css + aliases |
| premium-dark-refine | same | `--mj-bg` | `var(--pd-bg-1)` → `#0f1613` | Home/Search/Prayer/… canvas | aliases ← `--surface-app` |
| premium-dark-refine | same | `--mj-splash` | `var(--pd-bg-1)` | splash / boot | aliases |
| premium-dark-refine | same | `--mj-surface` | `var(--pd-bg-2)` → `#1b2421` | cards / chrome | aliases |
| premium-dark-refine | same | `--mj-surface-3` | `var(--pd-elevated)` → `#2b3933` | interactive | aliases |
| premium-dark-refine | same | `--mj-ink` / `--mj-ink-2` / `--mj-muted` | `--pd-ink*` warm | all product text | aliases |
| premium-dark-refine | same | `--mj-accent` | `var(--pd-gold)` | accents | aliases |
| premium-dark-refine | same | `--mj-hairline` | `var(--pd-border-subtle)` | borders | aliases ← `--dark-border-subtle` |
| premium-dark-refine | same | `--mj-elev-1/2/3` | `var(--pd-elev-*)` | elevation | theme `--dark-elev-*` + aliases |
| dark-design-system | same | `--mj-bg` … `--mj-muted` (×7) | superseded by premium | compat remap | **removed** (consume aliases) |
| dark-design-system | `@media (dynamic-range: high)` | `--mj-bg` | `#0c1210` OLED | HDR devices | aliases HDR block |
| dark-mode-recovery | `html[data-theme=dark], html.dark` | `--mj-bg` … `--mj-hairline` (×7) | `--dm-*` then premium | sync FOUC bridge | **removed**; `--surface-app` kept |

Load order (winning): `theme.css` → `theme-aliases` → `dark-mode-recovery` (sync) → deferred `dark-design-system` → `premium-dark-refine`.

## AFTER

| Metric | Measured |
|---|---:|
| `mjDeclOutsideAllowlist` | **0** (−30) |
| `mjDeclarations` | **193** (−22) |
| `hexInCss` | **9090** (−13 vs prior ceiling 9103) |
| `rgbHslInCss` | **2214** (−3) |
| `important` | **4798** (unchanged) |
| Outside `--mj-*` in three bridges | **0** |
| New token families | **0** |
| New `!important` | **0** |

## MJ_OUTSIDE

All 30 declarations removed from non-allowlisted sheets. Night `--mj-*` SoT:

1. `app/styles/theme.css` — Dark System Contract literals  
2. `styles/theme-aliases.css` — absorb + live `--mj-bg: var(--surface-app)` + HDR deepen  
3. Foundation `--sf-*` / `--sf2-*` unchanged as semantic SoT for their prefixes (no second dark authority)

## DARK_BRIDGES

| File | Class | PR2 action |
|---|---|---|
| `dark-mode-recovery.css` | **ACTIVE** | KEEP import · `--dm-*` + chrome rules · **no `--mj-*` decls** |
| `dark-mode-surfaces.css` | **ACTIVE** | KEEP · surfaces / bottom-nav (`--dm-bottom-nav`) |
| `dark-design-system.css` | **COMPATIBILITY** | KEEP import · card/soft patches · **no `--mj-*` decls** · HDR moved to aliases |
| `premium-dark-refine.css` | **ACTIVE** | KEEP · `--pd-*` polish + elevation consumers · **no `--mj-*` decls** |
| `pages/luxury-night-v2.css` | **COMPATIBILITY** | KEEP deferred · no mass delete |
| `sunnah-identity-luxury-night.css` | **COMPATIBILITY** | KEEP identity polish |
| `components/dark-emerald-menus.css` | **COMPATIBILITY** | KEEP menu polish · not a parallel token authority |

**REMOVE_CANDIDATE:** none (parity incomplete without consumer rules).  
**BLOCKED:** mushaf reader CSS · admin CSS · prayer calculation.

## ACTIVE_COMPATIBILITY

- Recovery / refine remain **ACTIVE** for `--dm-*` / `--pd-*` and leak-fix selectors.  
- Design-system + luxury-night + dark-emerald menus = **COMPATIBILITY** (no import strip this PR).  
- Footprint reduced by eliminating duplicate `--mj-*` remaps (inventory outside 30→0), not by deleting bridge files.

## REMOVED

| Removed | Where |
|---|---|
| 15× `--mj-*` decls | `premium-dark-refine.css` |
| 8× `--mj-*` decls | `dark-design-system.css` (incl. HDR `--mj-bg`) |
| 7× `--mj-*` decls | `dark-mode-recovery.css` |
| Competing aliases night hex `#121816` / cool ink | `theme-aliases.css` (replaced by contract) |

No CSS file deleted. No bridge import removed from `main.tsx` / `ThemePreferenceProvider`.

## TESTS

| Gate | Role |
|---|---|
| `closure-pr2-dark-token-absorb-gate.test.ts` | outside=0 · aliases absorb · report sections · inventory `--check` |
| `premium-dark-theme-gate.test.ts` | updated — refine has no `--mj-*` decls; theme/aliases own brand-deep |
| `dark-mode-authority-gate.test.ts` | existing switch / no invert |
| `test:dark-mode-authority` / `test:sunnah-ui-refinement` | CI chain |

Parity routes (Light / Dark / System — source + authority contract; no FOUC from competing `#121816`):

Home · Search · Prayer · Quran Hub · Hadith · Lessons · Settings · Mushaf (mushaf appearance remains MUSHAF_SPECIAL).

## REGRESSIONS

- No prayer engine / adhan logic changes.  
- No mushaf text/mapping/geometry.  
- No invert filters.  
- No new token family / `!important` / raw color systems.  
- Closed programs not reopened.

Verification (tip `cdb624779`, local):

| Step | Result |
|---|---|
| `verify:preflight` | PASS |
| `verify:ci` | PASS (~308s; mushaf measure+gates PASS) |
| `release:verify` | PASS (`TECHNICALLY_VERIFIED_WITH_EXTERNAL_BLOCKERS`) |
| Prayer P0 (release:verify) | PASS |


## REMAINING_DEBT

| Area | Next |
|---|---|
| Bridge **file** retirement | Only after route visual parity proof → REMOVE_CANDIDATE per file |
| Legacy CSS Retirement | PR3+ (out of this wave) |
| Mushaf UI chrome | Separate wave |
| Floating layer | Separate wave |
| Interaction Wave B+ | Raw buttons / div onClick (PR1 remainder) |
| Public selects | 14 residual (PRAYER/MUSHAF justified + MIGRATE_NOW) |

**Program status:** `WEB_RELEASED_NATIVE_HOLD` · `VISUAL_INTERACTION_PARTIAL`
