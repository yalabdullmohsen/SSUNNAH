-- ====================================================================
-- ROLLBACK — ARABIC_SEARCH_INFRASTRUCTURE (v2)
-- REQUIRES_EXPLICIT_APPROVAL on Production.
-- Run LAST (after v5, v4, v3 rollbacks). Returns the database to the
-- pre-v2 production state: no ar_normalize, no search_* RPCs added by
-- v2/v4-rollback, original whitespace-only normalize_ar.
-- Does NOT drop pg_trgm (pre-existing in production).
-- ====================================================================

DROP FUNCTION IF EXISTS public.search_content(text, text[], integer, integer);
DROP FUNCTION IF EXISTS public.search_scholars(text, int);
DROP FUNCTION IF EXISTS public.search_sheikhs(text, int);
DROP FUNCTION IF EXISTS public.search_lessons(text, int);
DROP FUNCTION IF EXISTS public.search_library_items(text, int);
-- SETOF shims re-created by the v4 rollback (absent before v2)
DROP FUNCTION IF EXISTS public.search_hadith_items(text, int);
DROP FUNCTION IF EXISTS public.search_hadiths(text, int);
DROP FUNCTION IF EXISTS public.search_sources(text, int);

DROP INDEX IF EXISTS public.idx_lessons_search_vector;
DROP INDEX IF EXISTS public.idx_lessons_title_ar_trgm;
DROP INDEX IF EXISTS public.idx_sheikhs_search_vector;
DROP INDEX IF EXISTS public.idx_scholars_name_trgm;
DROP INDEX IF EXISTS public.idx_books_search_vector;
DROP INDEX IF EXISTS public.idx_books_title_trgm;
DROP INDEX IF EXISTS public.idx_hadith_search_vector;
DROP INDEX IF EXISTS public.idx_hadith_title_trgm;
DROP INDEX IF EXISTS public.idx_sources_name_trgm;

-- Restore the pre-v2 production normalize_ar (whitespace-only), then rebuild
-- sharia_rulings vectors that were built with the newer normalization.
CREATE OR REPLACE FUNCTION public.normalize_ar(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL UNSAFE
SET search_path TO 'public'
AS $function$
  SELECT trim(regexp_replace(coalesce(input, ''), '\s+', ' ', 'g'));
$function$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sharia_rulings_search_vector_trigger') THEN
    UPDATE public.sharia_rulings SET title = title;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.ar_normalize(text);
