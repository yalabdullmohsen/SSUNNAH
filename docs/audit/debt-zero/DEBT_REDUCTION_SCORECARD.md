# DEBT_REDUCTION_SCORECARD — Application Debt Zero program

Date_UTC: 2026-10-03
Base tip: `050179c3f` (#2516)
Program PR: #2517

## Visual

| Metric | Start (#2516) | After | Notes |
|--------|---------------|-------|-------|
| hexInCss | 6956 | 6956 | Mass fallback strip REVERTED (contrast+snapshot) |
| inlineColorStyleMatches | 39 | 39 | held |
| important | 4747 | 4747 | held |
| borderRadiusPxDecls | 392 | 392 | held |

## Interaction

| Metric | Start | After | Δ |
|--------|-------|-------|---|
| rawButtonFiles | 84 | 76 | −8 |
| rawButtonElements | 360 | 311 | −49 (−13.6%) |
| officialButtonImportFiles | 279 | 287 | +8 |
| divSpanOnClick | 41 | 41 | overlay dismiss KEEP |
| unjustified REPLACE_WITH_BUTTON | 0 | 0 | held |

## Mushaf

| Metric | Status |
|--------|--------|
| hotspots | 0 held |
| overlay subscriptions | 1 held |
| off-pane inert when settled | NEW |
| content-visibility auto off-pane | NEW |

## Routes

| Metric | Status |
|--------|--------|
| stale unset | 0 |
| stale KEEP_JUSTIFIED | 223 |
| stale NOT_APPLICABLE | 190 |

## Policy

- No ceiling raises
- UNKNOWN_INTERNAL_DEBT = 0
- Gate: `test:debt-zero-unification`
