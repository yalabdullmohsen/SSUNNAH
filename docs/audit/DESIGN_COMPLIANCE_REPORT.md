# DESIGN_COMPLIANCE_REPORT

Generated: 2026-10-03T08:57:18.355Z

## DESIGN_COMPLIANCE_SCORE: **74**

## Signals

### Non-authority components (top)

- **cards**: bypass=208 · adoption=9%
- **forms**: bypass=148 · adoption=23%
- **buttons**: bypass=100 · adoption=71%
- **lists**: bypass=74 · adoption=10%
- **tabs**: bypass=71 · adoption=4%
- **tables**: bypass=14 · adoption=39%

### Rogue styling proxies

| Metric | Value | Ceiling |
|---|---:|---:|
| hexInCss | 7022 | 7022 |
| boxShadowDecls | 986 | 986 |
| borderRadiusPxDecls | 392 | 392 |
| inlineColorStyleMatches | 48 | 48 |

### Duplicate pattern clusters

- **cards**: 41 files → AppCard / InteractiveCard
- **filters**: 15 files → FILTER_AUTHORITY_MAP
- **dialogs**: 12 files → ConfirmDialog
- **status**: 6 files → Feedback V2 (Empty/Loading/Error/Offline)
- **forms**: 3 files → FormLabel · FieldError · SearchInput
- **results**: 2 files → Search + EmptyStateV2 / NoResultsState

## COMPONENT_COMPLIANCE_INDEX

| Component | Adoption % | Rating |
|---|---:|---|
| cards | 9 | NOT_CERTIFIED |
| buttons | 71 | PARTIAL |
| forms | 23 | NOT_CERTIFIED |
| tables | 39 | NOT_CERTIFIED |
| lists | 10 | NOT_CERTIFIED |
| tabs | 4 | NOT_CERTIFIED |
| navigation | 94 | CERTIFIED |
| modals | 96 | CERTIFIED |

Engine: `scripts/design-compliance-engine.mjs`
