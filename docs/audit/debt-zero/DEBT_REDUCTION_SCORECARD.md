# DEBT_REDUCTION_SCORECARD — Application Debt Zero program

Date_UTC: 2026-10-03  
Base tip: `050179c3f` (#2516)  
Program PR: `cursor/sunnah-debt-zero-pra`

## Visual

| Metric | Start (#2516) | After | Δ | % |
|--------|---------------|-------|---|---|
| hexInCss | 6956 | 6319 | −637 | −9.16% |
| inlineColorStyleMatches | 39 | 39 | 0 | 0% |
| important | 4747 | 4747 | 0 | held |
| borderRadiusPxDecls | 392 | 392 | 0 | held |
| boxShadowDecls | 986 | 986 | held |
| zIndexRawDecls | 257 | 257 | held |

## Interaction

| Metric | Start | After | Δ |
|--------|-------|-------|---|
| rawButtonFiles | 84 | 76 | −8 |
| rawButtonElements | 360 | 311 | −49 (−13.6%) |
| officialButtonImportFiles | 279 | 287 | +8 |
| divSpanOnClick | 41 | 41 | held (overlay dismiss) |
| formButtonsMissingType | 0 | 0 | held |
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
| stale KEEP_JUSTIFIED | 223 (documented) |
| stale NOT_APPLICABLE | 190 |
| PRIORITY_CLOSED | 14 |

## Policy

- No ceiling raises
- UNKNOWN_INTERNAL_DEBT = 0 (all residuals in KEEP_JUSTIFIED inventory)
- Gate: `test:debt-zero-unification`
