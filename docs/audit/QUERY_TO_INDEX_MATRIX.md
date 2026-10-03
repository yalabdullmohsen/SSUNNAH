# QUERY_TO_INDEX_MATRIX

Date_UTC: 2026-10-03
Source_migration: artifacts/majalis/supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql
Live_proof: PENDING (BLOCKED_CREDENTIAL_STAGING)
PRODUCTION_INDEX_DELETION_NOT_PERFORMED: true

## Classification legend

JUSTIFIED — expression/predicate aligns with RPC/query in repo  
PENDING_LIVE_PROOF — justified statically; needs Staging EXPLAIN  
DUPLICATE — logical overlap (none newly introduced)  
UNUSED_CANDIDATE — no current query path found (do not drop in Prod)  
HIGH_WRITE_COST — GIN/trgm on write-heavy tables  
LARGE_DISK_RISK — concurrent build recommended

## Indexes

1. idx_hadith_rel_verified_auth_collection — JUSTIFIED / PENDING_LIVE_PROOF  
   Query: search_hadiths filters authenticity_class + collection; getVerifiedHadith

2. idx_hadith_rel_verified_collection_chapter — JUSTIFIED / PENDING_LIVE_PROOF  
   Query: search_hadiths p_collection + p_chapter

3. idx_hadith_rel_verified_source_name — JUSTIFIED / PENDING_LIVE_PROOF  
   Query: search_hadiths p_source_name via ar_normalize(source_name)

4. idx_hadith_rel_verified_narrator — JUSTIFIED / PENDING_LIVE_PROOF  
   Query: search_hadiths p_narrator via ar_normalize(narrator)

5. idx_hadith_filter_verified_updated — JUSTIFIED / PENDING_LIVE_PROOF  
   Query: verified list/order paths; tie-breaker support

6. idx_trusted_sources_filter_active_category — JUSTIFIED / PENDING_LIVE_PROOF  
   Query: search_sources is_active + category

7. idx_trusted_sources_filter_active_type — JUSTIFIED / PENDING_LIVE_PROOF  
   Query: search_sources is_active + source_type

8. idx_scholarly_sources_filter_active_type — JUSTIFIED / PENDING_LIVE_PROOF  
   Parallel registry; optional path

9. idx_hadiths_title_trgm — JUSTIFIED / HIGH_WRITE_COST / LARGE_DISK_RISK / PENDING_LIVE_PROOF  
   Expression: gin(ar_normalize(title)) matches similarity/LIKE paths

10. idx_hadiths_narrator_trgm — JUSTIFIED / HIGH_WRITE_COST / PENDING_LIVE_PROOF

11. idx_hadiths_source_name_trgm — JUSTIFIED / HIGH_WRITE_COST / PENDING_LIVE_PROOF

12. idx_hadiths_search_trgm — JUSTIFIED / HIGH_WRITE_COST / LARGE_DISK_RISK / PENDING_LIVE_PROOF  
    Expression: gin(search_text) matches `%` / similarity on search_text

13. idx_sources_name_trgm — JUSTIFIED / HIGH_WRITE_COST / PENDING_LIVE_PROOF

14. idx_sources_search_trgm — JUSTIFIED / HIGH_WRITE_COST / PENDING_LIVE_PROOF

15. idx_scholarly_sources_name_trgm / idx_scholarly_sources_search_trgm — JUSTIFIED / PENDING_LIVE_PROOF

16. idx_hadiths_search_vector — JUSTIFIED / HIGH_WRITE_COST / LARGE_DISK_RISK / PENDING_LIVE_PROOF  
    GIN(search_vector) matches @@ plainto_tsquery('simple', qn)

17. idx_sources_search_vector — JUSTIFIED / PENDING_LIVE_PROOF

18. idx_scholarly_sources_search_vector — JUSTIFIED / PENDING_LIVE_PROOF

## Alignment rules verified statically

- FTS uses simple config in both generated column and RPC
- Trigram ops use same ar_normalize(...) expression as query
- Partial predicates include verification_status='verified' / deleted_at IS NULL / is_active where applicable
- No CREATE INDEX CONCURRENTLY inside migration transaction (runbook separate)
- No Production index deletion performed

## Client query inventory (non-RPC)

- flashcard .in(id) — PK — JUSTIFIED
- categories bulk .in(category_id) — filter — JUSTIFIED
- learning-paths assessment .in(id) — PK — JUSTIFIED
