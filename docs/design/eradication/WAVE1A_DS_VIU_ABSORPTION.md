# Wave 1A — design-system + visual-identity-unify absorption

TASK_CLASSIFICATION: SHARED_PLATFORM  
Program tip base: `4c93850e` (after Wave 0)  
Targets: `styles/design-system.css` · `styles/visual-identity-unify.css`

## Platform impacts

- WEB_IMPACT: fewer unsafe Hex fallbacks; unify token aliases absorbed into theme-aliases; dead selectors removed
- IOS_APPLICATION_IMPACT: shared WebView CSS only; no native binary / Build
- APP_STORE_PRODUCT_IMPACT: none
- SHARED_PLATFORM_IMPACT: reduces duplicate visual authority / reload-to-win token redefs

## What changed

### visual-identity-unify.css

- Removed duplicate `:root` / dark color+radius alias blocks (ABSORB_TO_FOUNDATION → `theme-aliases.css`)
- Stripped all unsafe `var(--token, #hex)` fallbacks (0 remaining)
- Remaining Hex literals: **0**
- Remaining file = UI override rules (buttons / chips / search / bottom-nav) still imported deferred — **KEEP_TEMPORARILY_WITH_EVIDENCE** until Button/Filter authorities own them without !important cascade (Waves F/G)

### design-system.css

- Stripped **63** unsafe Hex fallbacks (0 remaining unsafe fallbacks in file)
- Hex literals **107 → 44**
- Deleted DEAD_WITH_PROOF: `.fiqh-adopted-opinion`, `.tawheed-breadcrumb*` (0 TSX/TS consumers)
- Live `.ds-*` component rules kept (PageShell / ds-btn / ds-card consumers) — **KEEP_TEMPORARILY_WITH_EVIDENCE**

### theme-aliases.css

- Absorbed unify semantic `--color-*` / `--ss-*` / `--surface-app` bridges
- Absorbed `--radius-control` + Foundation `--sf-*` bridges (floor held)
- Fixed `var(--sf-radius-card, 1.5rem));` typo
- Stripped unsafe Hex fallbacks on established tokens

## Measured delta (global)

| Metric | Before (W0) | After (W1A) |
|---|---:|---:|
| hexInCss | 5763 | **5657** (−106) |
| rgbHslInCss | 2008 | **2006** (−2) |
| unsafeHexFallback | 2679 | **2574** (−105) |
| important | 4746 | 4746 |
| sync CSS imports | 14 | 14 |
| ABSORB_NOW layers | 6 | 6 (residual classified) |

Ceilings lowered to measured. NO_BASELINE_CEILING_RAISE.

## Residuals (item-level)

1. `visual-identity-unify.css` — KEEP_TEMPORARILY_WITH_EVIDENCE — unique !important button/chip/nav wins; delete only after Wave F/G authority proof
2. `design-system.css` — KEEP_TEMPORARILY_WITH_EVIDENCE — live `ds-*` JSX consumers + feature islands (hcp/tasbih/tawheed/am/hcz)
3. Remaining bare Hex in design-system (44) — KEEP_TEMPORARILY_WITH_EVIDENCE pending semantic token map per selector

## Outputs

- HEX_AND_FALLBACK_COUNTS_REDUCED
- NO_DUPLICATE_VISUAL_AUTHORITY (unify token redefs removed)
- CSS_LAYER_COUNT unchanged (files retained with evidence)
- ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE
- CRITICAL sync CSS = 14 held
- NO_QURAN_INTEGRITY_CHANGE · NO_PRAYER_CALCULATION_CHANGE

## Rollback

Revert this PR; theme-aliases absorb + unify alias removal are co-dependent.
