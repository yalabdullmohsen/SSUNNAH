# ARABIC_HADITH_SOURCE_CLIENT_MIGRATION_PLAN

REQUIRES_EXPLICIT_APPROVAL: true  
PRODUCTION_MIGRATION_APPLIED: false

## Goal

Replace ILIKE hadith fallback with ranked RPCs after Staging SQL apply.

## Steps

1. Apply v4 on Staging (owner approval for Production later).
2. Confirm RPC shapes:
   - search_hadiths(q, lim, p_collection, p_chapter, p_authenticity_class, p_source_name, p_narrator, p_cursor_score, p_cursor_id)
   - search_sources(q, lim, p_category, p_source_type, p_cursor_score, p_cursor_id)
3. Client helpers already added:
   - searchHadithsDb / searchSourcesDb in src/lib/arabic-db-search.ts
4. Migrate searchHadithFallback in supabase.ts:
   - Prefer searchHadithsDb(term, 10)
   - Keep ILIKE only as emergency fallback if RPC missing (42702/42883)
5. HadithView browse filters stay on getVerifiedHadith (equality indexes cover it).
6. Do not wire admin trusted_sources select("*") into public search; use searchSourcesDb.
7. Update UI to show matched_field + relevance_score only in debug/analytics if needed.
8. Pagination: pass cursor_score + cursor_id from last row; do not use OFFSET for RPC path.

## Acceptance

- No ILIKE in searchHadithFallback hot path when RPC healthy
- Empty query returns []
- Short query length < 2 only exact title/number
- RLS still hides non-verified rows for anon
