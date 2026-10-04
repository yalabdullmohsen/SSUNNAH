# Wave 1C — final-release + sections-calm-polish absorption

TASK_CLASSIFICATION: SHARED_PLATFORM  
Program tip base: `8d92504d` (after Wave 1B)  
Targets: `styles/final-release.css` · `styles/sections-calm-polish.css`

## Platform impacts

- WEB_IMPACT: unsafe Hex fallbacks reduced on cascade-seal / calm layers; calm `--radius-control` on Foundation
- IOS_APPLICATION_IMPACT: shared WebView CSS only; no Build
- APP_STORE_PRODUCT_IMPACT: none
- SHARED_PLATFORM_IMPACT: ABSORB_NOW residual classified with evidence (layers retained)

## What changed

### final-release.css
- Stripped established-token Hex fallbacks (−9)
- Hex **20 → 11**; residual unsafe: `clr-surface`, `danger-bg` (legacy aliases — KEEP_TEMPORARILY_WITH_EVIDENCE)

### sections-calm-polish.css
- Stripped established-token Hex fallbacks
- `--radius-control: 14px` → `var(--sf-radius-control)`
- Residual badge-filter Hex fallbacks kept until badge authority owns dark chips (Wave G)

## Measured delta (global)

| Metric | Before (W1B) | After (W1C) |
|---|---:|---:|
| hexInCss | 5630 | **5619** (−11) |
| unsafeHexFallback | 2562 | **2551** (−11) |
| sync CSS | 14 | 14 |
| ABSORB_NOW | 6 | 6 (residual) |

## Residuals

1. `final-release.css` — KEEP_TEMPORARILY_WITH_EVIDENCE — WAVE7 CASCADE SEAL + late chrome wins; delete only after authority proof
2. `sections-calm-polish.css` — KEEP_TEMPORARILY_WITH_EVIDENCE — section card radius/touch polish still consumed by gates
3. Remaining badge/clr Hex fallbacks — KEEP_TEMPORARILY_WITH_EVIDENCE

## Outputs

- HEX_AND_FALLBACK_COUNTS_REDUCED
- ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE
- NO_BASELINE_CEILING_RAISE
- NO_QURAN_INTEGRITY_CHANGE
