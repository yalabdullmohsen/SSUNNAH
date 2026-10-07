-- ====================================================================
-- ROLLBACK — ARABIC_SEARCH_NORMALIZE_PARITY (v5)
-- REQUIRES_EXPLICIT_APPROVAL on Production.
-- Restores the v4 body of public.ar_normalize (copied verbatim from
-- migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql) and
-- rebuilds the indexes / trigger-maintained columns that depend on it.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.ar_normalize(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT trim(both FROM regexp_replace(
    regexp_replace(
      translate(
        lower(
          regexp_replace(
            regexp_replace(input, 'ئو', 'وو', 'g'),
            E'[ً-ٟٓ-ٕؐ-ؚۖ-ۜ۟-ۤۧ-ٰۭـ]',
            '',
            'g'
          )
        ),
        E'أإآٱةىؤئک',
        E'ااااهيويك'
      ),
      'ء',
      '',
      'g'
    ),
    E'\\s+',
    ' ',
    'g'
  ));
$$;

COMMENT ON FUNCTION public.ar_normalize(text) IS
  'Arabic search normalize only (IMMUTABLE STRICT). Display text must stay vocalized. ة→ه KEEP for client parity.';

DO $$
DECLARE
  idx regclass;
BEGIN
  FOR idx IN
    SELECT i.indexrelid::regclass
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND pg_get_indexdef(i.indexrelid) ILIKE '%ar_normalize(%'
  LOOP
    EXECUTE format('REINDEX INDEX %s', idx);
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items' AND column_name = 'search_text'
  ) THEN
    UPDATE public.verified_hadith_items SET title = title;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trusted_sources' AND column_name = 'search_text'
  ) THEN
    UPDATE public.trusted_sources SET name = name;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scholarly_sources' AND column_name = 'search_text'
  ) THEN
    UPDATE public.scholarly_sources SET name = name;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sharia_rulings_search_vector_trigger') THEN
    -- normalize_ar delegates to ar_normalize: rebuild rulings vectors (R2 fix)
    UPDATE public.sharia_rulings SET title = title;
  END IF;
END $$;
