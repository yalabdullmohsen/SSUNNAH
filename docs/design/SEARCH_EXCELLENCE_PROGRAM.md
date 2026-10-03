# SEARCH_EXCELLENCE_PROGRAM — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Phases | BP–BT |
| Engine | `artifacts/majalis/scripts/search-excellence-engine.mjs` |
| Gate | `test:search-excellence` |

## Phases

1. **BP** ARABIC_SEARCH_OPTIMIZATION → ARABIC_SEARCH_NORMALIZATION_REPORT
2. **BQ** SEARCH_RELEVANCE_ENGINE_AUDIT → SEARCH_RELEVANCE_SCORECARD
3. **BR** SEARCH_QUERY_PERFORMANCE → SEARCH_QUERY_HEATMAP
4. **BS** SEARCH_INDEX_COVERAGE → SEARCH_COVERAGE_REPORT
5. **BT** SEARCH_UX_OPTIMIZATION → SEARCH_UX_IMPROVEMENT_PLAN
6. Certification → SEARCH_HEALTH_SCORECARD

## Rules

- Numbers-first; no invented wall-clock latency
- Normalization authority: `src/shared/arabic-normalize.ts`
- Index: `public/data/search/index.json` (schema ≥ SEARCH_INDEX_SCHEMA_VERSION)
- Do not weaken existing search gates
