# QUALITY_BASELINE_V1

**Program:** `SUNNAH_CONTINUOUS_GOVERNANCE_AND_REGRESSION_PREVENTION_PROGRAM`  
**Machine freeze:** `docs/governance/QUALITY_BASELINE_V1.json`  
**Base tip:** `75d349f1` (post Wave 2) · ceilings lowered further by Wave 3 / PR F  
**Policy:** **no-ceiling-raise** (decreasing-ceilings budgets may only fall)  
**Identity (permanent):** `SUNNAH_CANONICAL_PLATFORM_IDENTITY` — WEB · IOS · APP_STORE separated (`test:canonical-platform-identity`)

## Frozen truth (summary)

| Domain | Freeze | Source |
|---|---|---|
| Visual debt ceilings | hex ≤ 5616 · !important ≤ 4746 · rgb/hsl ≤ 2006 · rawButtonFiles ≤ 73 · … | `reports/visual-system-debt-budget.json` |
| Interaction debt | raw buttons ≤ 300 · files ≤ 73 · div/span onClick ≤ 41 · buttonHex ≤ 975 · … | `reports/interaction-system-debt-budget.json` |
| Local heroes | ≤ 95 parallel `*-hero` classes | global-component-authority |
| Bundle budgets | entry ≤ 120KiB+320 · icons ≤ 30KiB · CSS ≤ 100KiB | architecture-excellence PR-1 |
| Critical sync CSS | = 14 imports in `main.tsx` | runtime excellence |
| Mushaf fluidity | hotspots = 0 · neighbor prefetch guarded | mushaf-fluidity-audit |
| Route feedback | Empty/NoResults/Error/Offline/Loading V2 | product-completeness |
| Route matrix | stale unset = 0 | ROUTE_QUALITY_MATRIX |

## Goals locked by this baseline

- DESIGN_REGRESSION_PREVENTED
- PERFORMANCE_REGRESSION_PREVENTED
- MUSHAF_REGRESSION_PREVENTED
- ROUTE_REGRESSION_PREVENTED
- DEBT_GROWTH_PREVENTED
- PROJECT_HEALTH_VISIBLE

UNKNOWN_GOVERNANCE_DEBT = 0
