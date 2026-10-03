# VISUAL_DEBT_REDUCTION_REPORT

| Field | Value |
|-------|-------|
| Status | `VISUAL_DEBT_REDUCED` |
| Date UTC | 2026-10-03 |
| Authority | `artifacts/majalis/reports/visual-system-debt-budget.json` |
| Policy | decreasing-ceilings · no new token families · no raised ceilings |

## Before / after inventory

| Metric | HEAD main ceiling | After | Delta |
|--------|-------------------|-------|-------|
| `inlineColorStyleMatches` | 48 | **45** | −3 |
| `rawButtonFiles` (visual) | 102 | **97** | −5 |
| `officialButtonImportFiles` (floor) | 262 | **266** | +4 (floor↑ OK) |
| `sfTokenRefs` (floor) | 1128 | **1129** | +1 |
| `important` | 4747 | 4747 | held |
| `hexInCss` | 7022 | 7022 | held |
| `rgbHslInCss` | 2087 | 2087 | held |
| `boxShadowDecls` | 986 | 986 | held |
| `borderRadiusPxDecls` | 392 | 392 | held |
| `mjDeclOutsideAllowlist` | 0 | 0 | held |

## Rules compliance

- No new token families
- No raised ceilings
- Snapshots / contrast / a11y authorities not weakened
- Gate: `test:visual-system-debt-budget` PASS · `test:visual-system-authority` PASS

## Primary reducers

1. SinsAndRights inline color absorption (−inline)
2. Admin + sidebar Button authority adoption (−rawButtonFiles)

## Exit

```text
VISUAL_DEBT_REDUCED
CEILINGS_DECREASED_OR_HELD
FLOORS_HELD_OR_RAISED
```
