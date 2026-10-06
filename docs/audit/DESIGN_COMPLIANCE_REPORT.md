# DESIGN_COMPLIANCE_REPORT

Generated: 2026-10-06T19:03:57.542Z

## DESIGN_COMPLIANCE_SCORE: **77**

## Signals

### Non-authority components (top)

- **cards**: bypass=202 · adoption=9%
- **forms**: bypass=147 · adoption=23%
- **lists**: bypass=74 · adoption=9%
- **tabs**: bypass=68 · adoption=8%
- **tables**: bypass=13 · adoption=43%
- **buttons**: bypass=2 · adoption=99%

### Rogue styling proxies

| Metric | Value | Ceiling |
|---|---:|---:|
| hexInCss | 5212 | 5212 |
| boxShadowDecls | 1002 | 1002 |
| borderRadiusPxDecls | 349 | 349 |
| inlineColorStyleMatches | 38 | 38 |

### Duplicate pattern clusters

- **cards**: 39 files → AppCard / InteractiveCard
- **filters**: 14 files → FILTER_AUTHORITY_MAP
- **dialogs**: 12 files → ConfirmDialog
- **status**: 6 files → Feedback V2 (Empty/Loading/Error/Offline)
- **forms**: 3 files → FormLabel · FieldError · SearchInput
- **results**: 2 files → Search + EmptyStateV2 / NoResultsState

## COMPONENT_COMPLIANCE_INDEX

| Component | Adoption % | Rating |
|---|---:|---|
| cards | 9 | NOT_CERTIFIED |
| buttons | 99 | CERTIFIED |
| forms | 23 | NOT_CERTIFIED |
| tables | 43 | PARTIAL |
| lists | 9 | NOT_CERTIFIED |
| tabs | 8 | NOT_CERTIFIED |
| navigation | 94 | CERTIFIED |
| modals | 97 | CERTIFIED |

Engine: `scripts/design-compliance-engine.mjs`
