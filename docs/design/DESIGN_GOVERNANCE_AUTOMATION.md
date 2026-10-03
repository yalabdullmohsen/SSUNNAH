# DESIGN_GOVERNANCE_AUTOMATION — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `DESIGN_GOVERNANCE_AUTOMATED` · `DESIGN_DRIFT_DETECTED_AUTOMATICALLY` · `DESIGN_CONSISTENCY_SCORING` |
| Script | `artifacts/majalis/scripts/design-governance-report.mjs` |
| Coverage | `artifacts/majalis/scripts/authority-coverage-report.mjs` |
| Gate | `test:design-governance` · `test:polish-consistency` |

## What it validates

Colors · typography · spacing · sizes · shadows · borders · authority maps for buttons/cards/forms/tables/lists/tabs/nav/dialogs/alerts/responsive/interaction/admin/empty · visual debt ceilings · **component authority adoption**.

## Outputs

| File | Meaning |
|---|---|
| `docs/audit/DESIGN_AUTHORITY_REPORT.md` | Inventory of authority maps + exits |
| `docs/audit/DESIGN_DRIFT_REPORT.md` | Debt metrics vs ceilings · divergence · easiest wins |
| `docs/audit/DESIGN_CONSISTENCY_SCORE.md` | Human scorecard (0–100) |
| `artifacts/majalis/reports/DESIGN_CONSISTENCY_SCORE.json` | consistency · drift · adoption · wins |
| `docs/audit/AUTHORITY_COVERAGE_REPORT.md` | Per-family adoption + migration priority |

## CI

- `pnpm --filter @workspace/majalis run test:design-governance` (writes + checks)
- Wired into `test:sunnah-ui-refinement`
- Fast map check in `verify:preflight` via `scripts/design-governance-preflight.mjs`

## Enforcement

Do **not** introduce new color / type / spacing / shadow / border **systems** without updating the matching AUTHORITY map + gate.
