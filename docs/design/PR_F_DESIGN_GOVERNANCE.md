# PR F — Design governance completion

| Field | Value |
|---|---|
| Branch | `cursor/design-pr-f-design-governance` |
| TASK_CLASSIFICATION | SHARED_PLATFORM |

## Changes

- Uncommented empty CSS selectors removed; comment-documented empty anchors kept as KEEP_SPECIAL.
- `design-authority-closure-report.mjs` generates deterministic authority reports.
- Frozen token-prefix allowlist + deprecated-family ceilings.
- `test:design-authority-closure` wired into `test:ci-unit`, `test:design-governance`, `test:css-authority-graph`.
- QUALITY_BASELINE_V1 cssFiles freeze 356→353; new protection gate + success markers.
- design-governance-preflight requires closure report artifacts.

## Exit

DESIGN_AUTHORITY_REGRESSION_PREVENTED  
SELECTOR_DUPLICATION_REGRESSION_PREVENTED  
TOKEN_DRIFT_PREVENTED  
COMPATIBILITY_GROWTH_PREVENTED  
DEAD_CSS_GROWTH_PREVENTED  
NO_PARALLEL_GOVERNANCE_ENGINE
