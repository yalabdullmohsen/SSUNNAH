# DESIGN_SYSTEM_COMPLIANCE_ENGINE — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `DESIGN_SYSTEM_COMPLIANCE_ENGINE` |
| Script | `artifacts/majalis/scripts/design-compliance-engine.mjs` |
| Gate | `test:design-compliance-engine` (via `test:design-governance`) |

**Prevents future visual drift** by combining inventory, authority coverage, token proxies, duplication clusters, heatmap, and certification into one automated run.

## Detects

| Signal | Source |
|---|---|
| Non-authority components | `authority-coverage-report` |
| Rogue styling | `visual-system-inventory` debt metrics |
| Token violations (proxy) | hex/rgb vs sf/mj/ss refs |
| Duplicate patterns | filename/export clusters |
| Compliance score | weighted blend |

## Outputs

- `DESIGN_COMPLIANCE_REPORT` · `DESIGN_COMPLIANCE_SCORE`
- `COMPONENT_COMPLIANCE_INDEX`
- `TOKEN_COVERAGE_SCORECARD`
- `UI_DUPLICATION_REPORT`
- `CONSISTENCY_PRIORITY_MATRIX` (+ VISUAL_HEATMAP JSON)
- `PRODUCT_SURFACE_MAP`
- `SUNNAH_PRODUCT_CERTIFICATION_REPORT`

## CI

```bash
pnpm --filter @workspace/majalis run test:design-compliance-engine
```

## Non-claims

لا UNIFIED_100 · لا 100% token-driven claim · SPECIAL_CASE محفوظ.
