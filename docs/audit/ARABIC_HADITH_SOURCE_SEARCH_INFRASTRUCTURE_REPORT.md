# ARABIC_HADITH_SOURCE_SEARCH_INFRASTRUCTURE_REPORT

Phase: ARABIC_HADITH_SOURCE_SEARCH_INFRASTRUCTURE  
Mode: IMPLEMENTATION_WITH_PRODUCTION_APPROVAL_GATE  
Updated: 2026-10-03

## Exit flags

- REAL_SCHEMA_DISCOVERED: true
- ARABIC_NORMALIZATION_TESTED: true
- HADITH_RELATION_INDEXES_JUSTIFIED: true (denormalized text equality; no FKs invented)
- SOURCE_RELATION_INDEXES_JUSTIFIED: true (trusted_sources active filters; no parent_id)
- FILTER_INDEXES_JUSTIFIED: true
- TRIGRAM_INDEXES_READY: true (SQL declared)
- FTS_INDEXES_READY: true (SQL declared)
- SEARCH_HADITHS_RPC_READY: true (SQL declared)
- SEARCH_SOURCES_RPC_READY: true (SQL declared)
- RELEVANCE_RANKING_TESTED: true (offline fixtures)
- RLS_PRESERVED: true (SECURITY INVOKER; verified-only predicate in RPC)
- LOCAL_MIGRATION_PASS: true (test:search-excellence + test:arabic-hadith-source-search-v4)
- ROLLBACK_READY: true
- PRODUCTION_APPROVAL_REQUIRED: true
- PRODUCTION_MIGRATION_APPLIED: false

## Real schema summary

Hadiths physical table: public.verified_hadith_items  
PK: id text  
Arabic text columns: title, text, narrator, scholar, source_name, chapter, explanation, keywords[]  
Status: verification_status IN (verified,needs_review,rejected,duplicate,archived)  
Class: authenticity_class IN (sahih,daif,mawdu)  
Book/chapter: collection + chapter (text, not FK)  
No: source_id, narrator_id, category_id, book_id, chapter_id, hadith_tags

Sources physical table: public.trusted_sources  
PK: id uuid  
Columns: name, source_type, url, category, trust_level, is_active, last_synced_at, created_at  
No: description, parent_id, language  
Parallel: public.scholarly_sources (name, name_ar, entity_name, …)

## Artifacts

- supabase/arabic_search_hadith_source_infra_v4.sql
- supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql
- supabase/arabic_search_hadith_source_infra_v4_rollback.sql
- docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md
- src/lib/arabic-search-relevance.ts
- src/lib/__tests__/arabic-hadith-source-search-v4.test.ts
- scripts/arabic-search-explain-benchmark.mjs

## ة→ه decision

KEEP — matches src/shared/arabic-normalize.ts; normalization pairs 12/12 / fixture pairs pass; converting improves recall for صلاة/صلاه without separate synonym table.

## Next

Owner approval required before any Production SQL apply.
