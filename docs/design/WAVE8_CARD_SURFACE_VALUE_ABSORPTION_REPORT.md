# WAVE8 — Card Surface & Raw Visual Value Absorption Report

| Field | Value |
|---|---|
| Branch | `cursor/final-repo-closure-wave8` |
| Baseline tip | `ae78fe56` (= production MATCH post-WAVE7) |
| Status | **IMPLEMENTED** |

## IMPLEMENTATION_FROZEN (WAVE8)

Declared after product patches below. Scope Manifest:

| | |
|---|---|
| **Goal** | Absorb repeated raw surface values (inline colors, bare radii px, raw z-index) into Foundation / Theme / Card Surface Authority tokens without new Card/CSS systems |
| **Files** | HomeAboutSection · MutashabihatPage · ProphetsFamilyTreePage · existing page/shared CSS · visual debt budget/baseline · this report |
| **Tests** | visual-system-debt-budget · visual-system-authority · sunnah-ui-refinement · verify:preflight · verify:ci |
| **Out** | New Card system · new CSS aggregator · budget raises · floor lowers · Mushaf geometry · Prayer calc · Admin wave · snapshot updates |

## Classification of remaining debt (post-WAVE8)

| Class | Count / notes |
|---|---|
| CANONICAL | Foundation `--sf-radius-*`, `--z-*`, `--mj-*` / `--ss-type-*` used by migrated classes |
| ACTIVE_COMPATIBILITY | Existing AppCard / InteractiveCard / surface authority unchanged |
| KEEP_JUSTIFIED | SVG fill/stroke hex in ProphetsFamilyTree node canvas; AmradQalbiyya dynamic palette (deferred WAVE8+) |
| ADMIN_ONLY | Admin raw surfaces untouched (WAVE9) |
| MUSHAF_SPECIAL | Mushaf CSS boundary untouched (WAVE10 semantic only later) |
| DEVICE_REQUIRED | Light/Dark/System FOUC on device not claimed |

## Root cause

Public pages still carried:

1. Inline `style={{ color|background… }}` competing with token cascade.
2. Bare `border-radius: 12|16|20|24px` instead of `--sf-radius-*`.
3. Bare `z-index: 200` instead of `--z-nav` / sticky tokens.

No new Card system was required — absorption into existing files and tokens.

## Changes

1. **HomeAboutSection** — pillar/CTA inline colors → `.home-about__*` classes in `design-system.css` with `--mj-*` / `--sf-radius-*` / `--ss-type-*`.
2. **MutashabihatPage** — inline surface/type styles → `.mutash-*` in existing `quran.css` (+ route CSS import already present).
3. **ProphetsFamilyTreePage** — panel/legend/detail inline colors → `.pft-*` appended to existing `prophet-stories.css`.
4. **Shared CSS** — repeated bare radii `12/16/20/24px` → `var(--sf-radius-*)` across hub/auth/hadith/quran-people/tilawa/tajweed/qiraat/landmarks/shell/polish/home-search (no new CSS files).
5. **z-index** — `z-index: 200` → `var(--z-nav)` in design-system / final-release / notifications / language-offline / critical-first-paint / index where applicable.
6. **Debt budget** — ceilings lowered to measured; floors held or raised (`sfTokenRefs` 688→738, `ssTokenRefs` floor 722 held).

## Metrics (live inventory)

| Metric | Post-WAVE7 ceiling | WAVE8 measured | Δ |
|---|---:|---:|---:|
| cssFiles | 356 | 356 | 0 |
| important | 4787 | 4787 | 0 |
| hexInCss | 8979 | 8978 | −1 |
| rgbHslInCss | 2129 | 2129 | 0 |
| boxShadowDecls | 1113 | 1113 | 0 |
| borderRadiusPxDecls | 1303 | 1270 | −33 |
| zIndexRawDecls | 265 | 258 | −7 |
| inlineColorStyleMatches | 87 | 48 | −39 |
| mjDeclOutsideAllowlist | 0 | 0 | 0 |
| sfTokenRefs (floor) | 688 | 738 | +50 |
| ssTokenRefs (floor) | 722 | 722 | 0 |
| mainSyncCssImports | 22 | 22 | 0 |
| mainDeferredCssImports | 51 | 51 | 0 |

## Parity checklist

| Surface | Status |
|---|---|
| No new CSS file / Card system | held (`cssFiles` = 356) |
| Light / Dark / System tokens | unchanged authority; class colors use `--mj-*` |
| RTL | class migration only; no dir changes |
| Contrast / visual-snapshot | via verify:ci |
| Critical CSS budget | no sync import growth |
| Device visual | **DEVICE_REQUIRED** |

## Remaining FIXABLE (deferred)

| Item | Wave |
|---|---|
| Remaining public inline colors (48) | later polish / page waves |
| Admin raw surfaces / selects | WAVE9 |
| Mushaf control semantics | WAVE10 |
| index.css decomposition | WAVE12 |

## Verdict

WAVE8 **code absorption complete** with decreasing ceilings and non-regressing canonical floors. Ready for verify → PR → merge → deploy → smoke → WAVE9.
