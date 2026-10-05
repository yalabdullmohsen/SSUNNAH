# DESIGN_COMPLIANCE_REPORT

Generated: 2026-10-05T22:12:49.800Z

## DESIGN_COMPLIANCE_SCORE: **77**

## Signals

### Non-authority components (top)

- **cards**: bypass=198 · adoption=9%
- **forms**: bypass=144 · adoption=24%
- **lists**: bypass=73 · adoption=9%
- **tabs**: bypass=68 · adoption=8%
- **tables**: bypass=13 · adoption=43%
- **navigation**: bypass=1 · adoption=94%

### Rogue styling proxies

| Metric | Value | Ceiling |
|---|---:|---:|
| hexInCss | 5212 | 5546 |
| boxShadowDecls | 982 | 982 |
| borderRadiusPxDecls | 338 | 391 |
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
| buttons | 100 | CERTIFIED |
| forms | 24 | NOT_CERTIFIED |
| tables | 43 | PARTIAL |
| lists | 9 | NOT_CERTIFIED |
| tabs | 8 | NOT_CERTIFIED |
| navigation | 94 | CERTIFIED |
| modals | 97 | CERTIFIED |

Engine: `scripts/design-compliance-engine.mjs`
