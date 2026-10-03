# Automated Design QA — سُنّة

Date: 2026-10-03 · Batch 3

## Inventory (live engines)

| Artifact | Script / gate |
|---|---|
| Design authority inventory | `authority-coverage-report.mjs` → `AUTHORITY_COVERAGE_REPORT` |
| Token compliance | `token-compliance-report.mjs` → `TOKEN_COMPLIANCE_REPORT` + `design-tokens-authority.json` |
| Component authority coverage | authority-coverage + per-family gates (button/card/form/table/tab/search/overlay…) |
| Design drift | `design-governance-report.mjs` → `DESIGN_DRIFT_REPORT` / consistency score |
| Accessibility & contrast | Color contrast Playwright · on-brand contrast · static a11y gates |
| Responsive coverage | `RESPONSIVE_AUTHORITY_MAP` · responsive-breakpoints gate · ios-edge |
| Debt metrics | `visual-system-inventory` / `interaction-system-inventory` decreasing ceilings |

## CI protection (required / path-lane)

- contrast (Playwright)
- on-brand contrast
- visual snapshots
- token authority (`test:design-tokens-authority`)
- component authority (family gates under `test:sunnah-ui-refinement` / design-governance)
- debt ceilings (`test:visual-system-debt-budget` · interaction debt)
- responsive checks (breakpoints / ios-edge / native-feel)
- accessibility static checks (eslint jsx-a11y · form/button gates)

## Non-claims

Automated suites do **not** certify physical-device accessibility, WCAG lab certification, or Store GO.
Device / license / owner actions remain classified separately.
