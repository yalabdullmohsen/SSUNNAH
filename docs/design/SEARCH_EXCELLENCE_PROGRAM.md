# SEARCH_EXCELLENCE_PROGRAM — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Phases | BP–BU |
| Engine | `artifacts/majalis/scripts/search-excellence-engine.mjs` |
| Gate | `test:search-excellence` |

## Phases

1. **BP** ARABIC_SEARCH_OPTIMIZATION → ARABIC_SEARCH_NORMALIZATION_REPORT
2. **BQ** SEARCH_RELEVANCE_ENGINE_AUDIT → SEARCH_RELEVANCE_SCORECARD
3. **BR** SEARCH_QUERY_PERFORMANCE → SEARCH_QUERY_HEATMAP
4. **BS** SEARCH_INDEX_COVERAGE → SEARCH_COVERAGE_REPORT
5. **BT** SEARCH_UX_OPTIMIZATION → SEARCH_UX_IMPROVEMENT_PLAN
6. **BU** ARABIC_SEARCH_INFRASTRUCTURE_HARDENING → ARABIC_SEARCH_INFRASTRUCTURE_REPORT
7. Certification → SEARCH_HEALTH_SCORECARD

SQL authority: `supabase/arabic_search_infrastructure_v2.sql` (`public.ar_normalize` + FTS/trgm RPCs)

## Rules

- Numbers-first; no invented wall-clock latency
- Normalization authority: `src/shared/arabic-normalize.ts` + SQL `public.ar_normalize`
- Index: `public/data/search/index.json` (schema ≥ SEARCH_INDEX_SCHEMA_VERSION)
- Do not weaken existing search gates
