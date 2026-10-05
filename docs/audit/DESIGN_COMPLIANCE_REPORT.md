# DESIGN_COMPLIANCE_REPORT

Generated: 2026-10-05T17:49:33.332Z

## DESIGN_COMPLIANCE_SCORE: **76**

## Signals

### Non-authority components (top)

- **cards**: bypass=198 · adoption=9%
- **forms**: bypass=146 · adoption=24%
- **lists**: bypass=73 · adoption=10%
- **tabs**: bypass=69 · adoption=7%
- **tables**: bypass=13 · adoption=43%
- **buttons**: bypass=13 · adoption=96%

### Rogue styling proxies

| Metric | Value | Ceiling |
|---|---:|---:|
| hexInCss | 5224 | 5546 |
| boxShadowDecls | 982 | 982 |
| borderRadiusPxDecls | 338 | 391 |
| inlineColorStyleMatches | 38 | 38 |

### Duplicate pattern clusters

- **cards**: 39 files → AppCard / InteractiveCard
- **filters**: 15 files → FILTER_AUTHORITY_MAP
- **dialogs**: 12 files → ConfirmDialog
- **status**: 6 files → Feedback V2 (Empty/Loading/Error/Offline)
- **forms**: 3 files → FormLabel · FieldError · SearchInput
- **results**: 2 files → Search + EmptyStateV2 / NoResultsState

## COMPONENT_COMPLIANCE_INDEX

| Component | Adoption % | Rating |
|---|---:|---|
| cards | 9 | NOT_CERTIFIED |
| buttons | 96 | CERTIFIED |
| forms | 24 | NOT_CERTIFIED |
| tables | 43 | PARTIAL |
| lists | 10 | NOT_CERTIFIED |
| tabs | 7 | NOT_CERTIFIED |
| navigation | 94 | CERTIFIED |
| modals | 96 | CERTIFIED |

Engine: `scripts/design-compliance-engine.mjs`
