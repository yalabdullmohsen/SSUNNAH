# Wave 1B — premium-dark-refine + modern-ui-refresh absorption

TASK_CLASSIFICATION: SHARED_PLATFORM  
Program tip base: `5095c9de` (after Wave 1A)  
Targets: `styles/premium-dark-refine.css` · `styles/modern-ui-refresh.css`

## Platform impacts

- WEB_IMPACT: dark premium tokens bridge to live `--mj-*` / `--surface-*`; mur radii on Foundation; Hex debt reduced
- IOS_APPLICATION_IMPACT: shared WebView CSS only; no Build / TestFlight
- APP_STORE_PRODUCT_IMPACT: none
- SHARED_PLATFORM_IMPACT: ABSORB_NOW residual still classified with evidence for both layers

## What changed

### premium-dark-refine.css

- Keep locked `--pd-*` palette hex (incl. `--pd-card: #24302b`) — `--surface-app: var(--pd-bg-1)` one-way only (no cycle)
- Strip unsafe Hex fallbacks (0 remaining)
- Replace bare `#141c19` / `#0c1210` usages with token/color-mix
- Hex in file reduced vs pre-W1B; contrast regression from pd↔surface cycle fixed before merge

### modern-ui-refresh.css

- Collapse `var(--mj-brand, var(--mj-brand))` self-fallbacks
- Map `--mur-radius*` → `--sf-radius-*`
- Retire competing `--radius-button: 18px` → Foundation SM
- Dark hairline uses brand/surface tokens
- Hex in file: **7 → 1**; unsafe fallbacks **0**

## Measured delta (global)

| Metric | Before (W1A) | After (W1B) |
|---|---:|---:|
| hexInCss | 5657 | **5630** (−23) |
| unsafeHexFallback | 2574 | **2562** (−12) |
| sfTokenRefs floor | 1172 | **1180** (raised to measured) |
| ssTokenRefs floor | 761 | **762** |
| sync CSS | 14 | 14 |
| ABSORB_NOW layers | 6 | 6 (residual) |

## Residuals

1. `premium-dark-refine.css` — KEEP_TEMPORARILY_WITH_EVIDENCE — live dark elevation/!important polish; loaded via `ensureDarkLayersForBoot`
2. `modern-ui-refresh.css` — KEEP_TEMPORARILY_WITH_EVIDENCE — card/filter soft polish with !important; delete after Waves F/G authority proof
3. Locked `--pd-card: #24302b` — SPECIAL_CASE_WITH_EVIDENCE (AA gate)

## Outputs

- HEX_AND_FALLBACK_COUNTS_REDUCED
- ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE
- NO_BASELINE_CEILING_RAISE
- NO_QURAN_INTEGRITY_CHANGE
