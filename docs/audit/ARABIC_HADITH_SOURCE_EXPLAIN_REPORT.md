# ARABIC_HADITH_SOURCE_EXPLAIN_REPORT

REAL_SCHEMA_DISCOVERED: yes
Status: **NOT_CONNECTED**
PRODUCTION_MIGRATION_APPLIED: false
REQUIRES_EXPLICIT_APPROVAL: true

No DATABASE_URL / SUPABASE_DB_URL in environment.
EXPLAIN (ANALYZE, BUFFERS) intentionally skipped (local/staging only).

## Planned cases
- exact_title
- no_tashkeel
- hamza_variant
- typo
- narrator
- source_name
- partial_matn
- empty
- short
- sources_name

Re-run on Staging:
```bash
DATABASE_URL=... node artifacts/majalis/scripts/arabic-search-explain-benchmark.mjs
```
