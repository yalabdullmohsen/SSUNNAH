-- ====================================================================
-- ROLLBACK — ARABIC_HADITH_SOURCE_SEARCH_INFRASTRUCTURE (v4)
-- REQUIRES_EXPLICIT_APPROVAL on Production.
-- Safe to run after v4 apply; restores pre-v4 RPC shapes where possible.
-- Does NOT drop pg_trgm (may be used elsewhere).
-- Does NOT drop public.ar_normalize (shared authority).
-- ====================================================================

DROP FUNCTION IF EXISTS public.search_hadiths(text, int, text, text, text, text, text, double precision, text);
DROP FUNCTION IF EXISTS public.search_hadith_items(text, int);
DROP FUNCTION IF EXISTS public.search_sources(text, int, text, text, double precision, uuid);

DROP VIEW IF EXISTS public.hadiths;
DROP VIEW IF EXISTS public.sources;

DROP INDEX IF EXISTS public.idx_hadith_rel_verified_auth_collection;
DROP INDEX IF EXISTS public.idx_hadith_rel_verified_collection_chapter;
DROP INDEX IF EXISTS public.idx_hadith_rel_verified_source_name;
DROP INDEX IF EXISTS public.idx_hadith_rel_verified_narrator;
DROP INDEX IF EXISTS public.idx_hadith_filter_verified_updated;
DROP INDEX IF EXISTS public.idx_trusted_sources_filter_active_category;
DROP INDEX IF EXISTS public.idx_trusted_sources_filter_active_type;
DROP INDEX IF EXISTS public.idx_scholarly_sources_filter_active_type;

DROP INDEX IF EXISTS public.idx_hadiths_title_trgm;
DROP INDEX IF EXISTS public.idx_hadiths_narrator_trgm;
DROP INDEX IF EXISTS public.idx_hadiths_source_name_trgm;
DROP INDEX IF EXISTS public.idx_hadiths_search_trgm;
DROP INDEX IF EXISTS public.idx_hadiths_search_vector;
DROP INDEX IF EXISTS public.idx_sources_name_trgm;
DROP INDEX IF EXISTS public.idx_sources_search_trgm;
DROP INDEX IF EXISTS public.idx_sources_search_vector;
DROP INDEX IF EXISTS public.idx_scholarly_sources_name_trgm;
DROP INDEX IF EXISTS public.idx_scholarly_sources_search_trgm;
DROP INDEX IF EXISTS public.idx_scholarly_sources_search_vector;

-- Optional: drop generated search docs (re-apply v3 if needed)
ALTER TABLE IF EXISTS public.verified_hadith_items DROP COLUMN IF EXISTS search_vector;
ALTER TABLE IF EXISTS public.verified_hadith_items DROP COLUMN IF EXISTS search_text;
ALTER TABLE IF EXISTS public.trusted_sources DROP COLUMN IF EXISTS search_vector;
ALTER TABLE IF EXISTS public.trusted_sources DROP COLUMN IF EXISTS search_text;
ALTER TABLE IF EXISTS public.scholarly_sources DROP COLUMN IF EXISTS search_vector;
ALTER TABLE IF EXISTS public.scholarly_sources DROP COLUMN IF EXISTS search_text;

-- Recreate minimal v3-compatible RPCs (SETOF) so clients do not hard-fail
CREATE OR REPLACE FUNCTION public.search_hadiths(q text, lim int DEFAULT 20)
RETURNS SETOF public.verified_hadith_items
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT h.*
  FROM public.verified_hadith_items h
  WHERE h.deleted_at IS NULL
    AND h.verification_status = 'verified'
    AND public.ar_normalize(coalesce(q, '')) <> ''
    AND (
      public.ar_normalize(coalesce(h.title, '')) % public.ar_normalize(q)
      OR public.ar_normalize(coalesce(h.narrator, '')) % public.ar_normalize(q)
      OR public.ar_normalize(coalesce(h.text, '')) % public.ar_normalize(q)
    )
  ORDER BY similarity(public.ar_normalize(coalesce(h.title, '')), public.ar_normalize(q)) DESC
  LIMIT greatest(1, least(coalesce(lim, 20), 100));
$$;

CREATE OR REPLACE FUNCTION public.search_hadith_items(q text, lim int DEFAULT 20)
RETURNS SETOF public.verified_hadith_items
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM public.search_hadiths(q, lim);
$$;

CREATE OR REPLACE FUNCTION public.search_sources(q text, lim int DEFAULT 20)
RETURNS SETOF public.trusted_sources
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT s.*
  FROM public.trusted_sources s
  WHERE coalesce(s.is_active, true) = true
    AND public.ar_normalize(coalesce(q, '')) <> ''
    AND public.ar_normalize(s.name) % public.ar_normalize(q)
  ORDER BY similarity(public.ar_normalize(s.name), public.ar_normalize(q)) DESC
  LIMIT greatest(1, least(coalesce(lim, 20), 100));
$$;

GRANT EXECUTE ON FUNCTION public.search_hadiths(text, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_hadith_items(text, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_sources(text, int) TO anon, authenticated, service_role;
