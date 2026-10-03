# DESIGN_GOVERNANCE_AUTOMATION — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `DESIGN_GOVERNANCE_AUTOMATED` · `DESIGN_DRIFT_DETECTED_AUTOMATICALLY` |
| Script | `artifacts/majalis/scripts/design-governance-report.mjs` |
| Gate | `test:elevation-border-governance-authority` · `test:design-governance` |

## What it validates

Colors · typography · spacing · sizes · shadows · borders · authority maps for buttons/cards/forms/tables/lists/tabs/nav/dialogs/alerts/responsive · visual debt ceilings.

## Outputs

| File | Meaning |
|---|---|
| `docs/audit/DESIGN_AUTHORITY_REPORT.md` | Inventory of authority maps + exits |
| `docs/audit/DESIGN_DRIFT_REPORT.md` | Debt metrics vs ceilings · drift signals |
| `artifacts/majalis/reports/DESIGN_CONSISTENCY_SCORE.json` | 0–100 score + components |

## CI

- `pnpm --filter @workspace/majalis run test:design-governance` (writes + checks)
- Wired into `test:sunnah-ui-refinement`
- Fast map check in `verify:preflight` via `scripts/design-governance-preflight.mjs`

## Enforcement

Do **not** introduce new color / type / spacing / shadow / border **systems** without updating the matching AUTHORITY map + gate.
