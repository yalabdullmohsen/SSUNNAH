# ARABIC_HADITH_SOURCE_QUERY_INDEX_MATRIX

REAL_SCHEMA_DISCOVERED: yes  
REQUIRES_EXPLICIT_APPROVAL: true  
PRODUCTION_MIGRATION_APPLIED: false

## Query inventory → expected index

1) File: artifacts/majalis/src/lib/supabase.ts :: getVerifiedHadith  
   Columns: id,title,text,narrator,source_name,grade,authenticity_class,collection,chapter,explanation,keywords,hadith_number,metadata,created_at  
   WHERE: verification_status='verified' + optional collection/chapter/authenticity_class  
   ORDER: collection ASC, hadith_number ASC  
   LIMIT: up to 500  
   ILIKE: no · select("*"): no · N+1: no  
   Index: idx_hadith_rel_verified_auth_collection / idx_hadith_rel_verified_collection_chapter / idx_verified_hadith_collection

2) File: artifacts/majalis/src/lib/supabase.ts :: searchHadithFallback  
   Columns: id,title,text,narrator,collection,grade  
   WHERE: verification_status='verified' + OR ilike title|text|narrator  
   ORDER: none · LIMIT 10  
   ILIKE: yes · select("*"): no · N+1: pattern chunks parallel (not classic N+1)  
   Index: idx_hadiths_title_trgm / idx_hadiths_narrator_trgm / idx_hadiths_search_trgm → migrate to search_hadiths RPC

3) File: artifacts/majalis/src/pages/hadith/ui/HadithView.tsx  
   Uses getVerifiedHadith with authenticityClass filter  
   Index: idx_hadith_rel_verified_auth_collection

4) File: artifacts/majalis/src/lib/flashcard-service.ts  
   WHERE verification_status='verified' + id IN / NOT IN  
   Index: PK id + status partials; not search path

5) File: artifacts/majalis/src/lib/auto-content-service.ts :: adminGetTrustedSources  
   select("*") order name — admin path  
   Index: idx_trusted_sources_filter_active_category / name trgm for future search_sources

6) File: artifacts/majalis/src/lib/arabic-db-search.ts :: searchHadithsDb / searchSourcesDb  
   RPC search_hadiths / search_sources  
   Index: search_vector GIN + search_text trgm + filter partials

7) Global search (app-search / hadith-corpus): local corpus, not SQL — out of DB index scope

## Filters present in UI (hadith)

- authenticity_class: sahih|daif|mawdu
- collection (book code)
- chapter (text)
- client-side text search on loaded rows / local corpus

## Filters absent in schema (not implemented as FK)

- source_id, narrator_id, category_id, book_id, chapter_id, tag_id, language, published_at
