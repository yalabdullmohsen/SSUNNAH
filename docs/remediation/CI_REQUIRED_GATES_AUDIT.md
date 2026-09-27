# CI Required Gates Audit — Color contrast skip cascade

## Workflow steps (Color contrast job)

1. Download dist from `build` job (same SHA)
2. `pnpm --filter @workspace/majalis run test:color-contrast-gate`
3. `pnpm --filter @workspace/majalis run test:on-brand-contrast`
4. Guard: fail if either outcome ≠ success  
   Message: “Contrast gates must not skip when…” / outcome echo

## Findings

| Check | #2304 | #2305 | main `a9e7bf87` |
|---|---|---|---|
| path-lane need_color | yes | yes | yes |
| contrast executed | yes | yes | yes |
| contrast result | failure (NOT_FOUND) | failure (HARD_WHITE_BG) | success |
| on-brand result | success | success | success |
| guard step | fails (cascade) | fails (cascade) | success |

## Skip cause classification

**PRODUCT_RUNTIME_FAILURE / PRODUCT_DOM_CONTRACT** for the red PRs — not:

- ROUTE_NOT_AVAILABLE
- TEST_DISCOVERY_ERROR
- ENVIRONMENT_MISCONFIGURATION
- ARTIFACT_MISMATCH
- PATH_LANE_ERROR
- FEATURE_FLAG_ERROR
- PLAYWRIGHT_SETUP_ERROR
- EXPECTED_SKIP

The guard correctly refuses to treat a failed contrast run as a skip. Do not weaken required rules.

## Aggregate blockers

`Verify build` and `ci-required` fail when `color-contrast=failure` (and #2304 also had `visual-snapshot=failure` from ScrollToTop source gate).
