# ARABIC_HADITH_SOURCE_RELEVANCE_BENCHMARK

REAL_SCHEMA_DISCOVERED: yes  
REQUIRES_EXPLICIT_APPROVAL: true  
PRODUCTION_MIGRATION_APPLIED: false  
Live DB: NOT_CONNECTED

## Formula (SQL + TS mirror)

Weights applied when columns exist:

1. Exact normalized title/name = 1000
2. Exact hadith_number = 900
3. Prefix title/name = 700
4. Exact narrator = 500
5. Exact source_name = 450
6. FTS ts_rank_cd * 200 (weighted A/B/C/D vector)
7. Trigram similarity * 100 (max across title/narrator/source/search_text)
8. Freshness: NOT used for scientific relevance (updated_at only available as separate browse index)

## Offline fixture results (gate)

- Query "باب النية" → id=a title_exact first
- Query "1" → hadith_number match first
- Query "باب" → title_prefix first
- Query "عمر بن الخطاب" → narrator first
- Query "صحيح البخاري" → source_name first
- Empty query → score 0 / matched_field=empty
- Keyset pages → no duplicate ids

## Staging pending

- EXPLAIN ANALYZE buffer/latency comparison: see ARABIC_HADITH_SOURCE_EXPLAIN_REPORT.md (NOT_CONNECTED until DATABASE_URL)
