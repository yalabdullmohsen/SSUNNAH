-- ====================================================================
-- ARABIC_HADITH_SOURCE_SEARCH_INFRASTRUCTURE (v4)
-- REQUIRES_EXPLICIT_APPROVAL before any Production apply.
--
-- Real schema (discovered — do not invent FKs):
--   hadiths  → public.verified_hadith_items
--     PK id text; denormalized narrator/source_name/collection/chapter;
--     NO source_id / narrator_id / category_id / book_id / chapter_id / tag join
--   sources  → public.trusted_sources (+ scholarly_sources parallel registry)
--     NO parent_id / description / language columns on trusted_sources
--
-- Transactional migration: NO CREATE INDEX CONCURRENTLY here.
-- Production large indexes: see runbook
--   docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── 1. Arabic normalization authority ───────────────────────────────
-- QUALITY_DECISION ة→ه: KEEP (parity with src/shared/arabic-normalize.ts;
--   pairsEquivalent evidence in ARABIC_SEARCH_NORMALIZATION_REPORT).
-- STRICT: NULL in → NULL out; callers coalesce columns as needed.
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

CREATE OR REPLACE FUNCTION public.normalize_ar(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT public.ar_normalize(input);
$$;

-- Wrapper: to_tsvector(regconfig, text) is STABLE (catalog lookup). Generated
-- STORED columns require IMMUTABLE expressions — plpgsql body is accepted.
CREATE OR REPLACE FUNCTION public.to_tsvector_simple(input text)
RETURNS tsvector
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
BEGIN
  RETURN to_tsvector('simple'::regconfig, coalesce(input, ''));
END;
$$;

COMMENT ON FUNCTION public.to_tsvector_simple(text) IS
  'IMMUTABLE wrapper around to_tsvector(simple) for generated search_vector columns.';

-- ─── 2. Hadith search documents (generated stored) ───────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items'
  ) THEN
    RAISE NOTICE 'verified_hadith_items missing — skip hadith search docs';
    RETURN;
  END IF;

  -- Drop prior generated search docs to redefine weighted FTS (idempotent-ish)
  BEGIN
    ALTER TABLE public.verified_hadith_items DROP COLUMN IF EXISTS search_vector CASCADE;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER TABLE public.verified_hadith_items DROP COLUMN IF EXISTS search_text CASCADE;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items'
      AND column_name = 'search_text'
  ) THEN
    ALTER TABLE public.verified_hadith_items
      ADD COLUMN search_text text
      GENERATED ALWAYS AS (
        public.ar_normalize(
          concat_ws(
            ' ',
            coalesce(title, ''),
            coalesce(hadith_number, ''),
            coalesce(narrator, ''),
            coalesce(source_name, ''),
            coalesce(collection, ''),
            coalesce(chapter, ''),
            coalesce(array_to_string(keywords, ' '), ''),
            coalesce(explanation, ''),
            coalesce(text, '')
          )
        )
      ) STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items'
      AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE public.verified_hadith_items
      ADD COLUMN search_vector tsvector
      GENERATED ALWAYS AS (
        setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(title), '')), 'A')
        || setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(hadith_number), '')), 'A')
        || setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(text), '')), 'B')
        || setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(narrator), '')), 'B')
        || setweight(
             public.to_tsvector_simple(coalesce(
                 public.ar_normalize(
                   concat_ws(' ', coalesce(source_name, ''), coalesce(collection, ''), coalesce(chapter, ''))
                 ),
                 ''
               )
             ),
             'C'
           )
        || setweight(
             public.to_tsvector_simple(coalesce(
                 public.ar_normalize(
                   concat_ws(' ', coalesce(array_to_string(keywords, ' '), ''), coalesce(explanation, ''))
                 ),
                 ''
               )
             ),
             'D'
           )
      ) STORED;
  END IF;
END $$;

-- ─── 3. Source search documents ──────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'trusted_sources'
  ) THEN
    BEGIN
      ALTER TABLE public.trusted_sources DROP COLUMN IF EXISTS search_vector CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.trusted_sources DROP COLUMN IF EXISTS search_text CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'trusted_sources'
        AND column_name = 'search_text'
    ) THEN
      ALTER TABLE public.trusted_sources
        ADD COLUMN search_text text
        GENERATED ALWAYS AS (
          public.ar_normalize(
            concat_ws(
              ' ',
              coalesce(name, ''),
              coalesce(category, ''),
              coalesce(source_type, ''),
              coalesce(url, '')
            )
          )
        ) STORED;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'trusted_sources'
        AND column_name = 'search_vector'
    ) THEN
      ALTER TABLE public.trusted_sources
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(name), '')), 'A')
          || setweight(
               public.to_tsvector_simple(coalesce(public.ar_normalize(concat_ws(' ', coalesce(category, ''), coalesce(source_type, ''))), '')
               ),
               'C'
             )
          || setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(url), '')), 'D')
        ) STORED;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'scholarly_sources'
  ) THEN
    BEGIN
      ALTER TABLE public.scholarly_sources DROP COLUMN IF EXISTS search_vector CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.scholarly_sources DROP COLUMN IF EXISTS search_text CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'scholarly_sources'
        AND column_name = 'search_text'
    ) THEN
      ALTER TABLE public.scholarly_sources
        ADD COLUMN search_text text
        GENERATED ALWAYS AS (
          public.ar_normalize(
            concat_ws(
              ' ',
              coalesce(name, ''),
              coalesce(name_ar, ''),
              coalesce(entity_name, ''),
              coalesce(source_type, ''),
              coalesce(url, '')
            )
          )
        ) STORED;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'scholarly_sources'
        AND column_name = 'search_vector'
    ) THEN
      ALTER TABLE public.scholarly_sources
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(name), '')), 'A')
          || setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(name_ar), '')), 'B')
          || setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(entity_name), '')), 'B')
          || setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(source_type), '')), 'C')
          || setweight(public.to_tsvector_simple(coalesce(public.ar_normalize(url), '')), 'D')
        ) STORED;
    END IF;
  END IF;
END $$;

-- ─── 4. Relationship / filter B-tree indexes (real columns only) ─────
-- Justified by getVerifiedHadith / HadithView filters:
--   verification_status='verified', authenticity_class, collection, chapter
-- No FK columns exist → no source_id/narrator_id indexes.

CREATE INDEX IF NOT EXISTS idx_hadith_rel_verified_auth_collection
  ON public.verified_hadith_items (authenticity_class, collection, hadith_number, id)
  WHERE verification_status = 'verified' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hadith_rel_verified_collection_chapter
  ON public.verified_hadith_items (collection, chapter, hadith_number, id)
  WHERE verification_status = 'verified' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hadith_rel_verified_source_name
  ON public.verified_hadith_items (source_name, id)
  WHERE verification_status = 'verified' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hadith_rel_verified_narrator
  ON public.verified_hadith_items (narrator, id)
  WHERE verification_status = 'verified' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hadith_filter_verified_updated
  ON public.verified_hadith_items (updated_at DESC, id)
  WHERE verification_status = 'verified' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_trusted_sources_filter_active_category
  ON public.trusted_sources (category, name, id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_trusted_sources_filter_active_type
  ON public.trusted_sources (source_type, name, id)
  WHERE is_active = true;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'scholarly_sources'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_scholarly_sources_filter_active_type
      ON public.scholarly_sources (source_type, name, id)
      WHERE is_active = true;
  END IF;
END $$;

-- ─── 5. Trigram indexes (justified by ILIKE/search paths) ────────────
-- searchHadithFallback: title/text/narrator ILIKE
-- search_hadiths RPC: title/narrator/search_text % similarity
CREATE INDEX IF NOT EXISTS idx_hadiths_title_trgm
  ON public.verified_hadith_items
  USING gin (public.ar_normalize(title) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_hadiths_narrator_trgm
  ON public.verified_hadith_items
  USING gin (public.ar_normalize(narrator) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_hadiths_source_name_trgm
  ON public.verified_hadith_items
  USING gin (public.ar_normalize(source_name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_hadiths_search_trgm
  ON public.verified_hadith_items
  USING gin (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_sources_name_trgm
  ON public.trusted_sources
  USING gin (public.ar_normalize(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_sources_search_trgm
  ON public.trusted_sources
  USING gin (search_text gin_trgm_ops);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'scholarly_sources'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_scholarly_sources_name_trgm
      ON public.scholarly_sources
      USING gin (public.ar_normalize(name) gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_scholarly_sources_search_trgm
      ON public.scholarly_sources
      USING gin (search_text gin_trgm_ops);
  END IF;
END $$;

-- ─── 6. FTS GIN indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_hadiths_search_vector
  ON public.verified_hadith_items
  USING gin (search_vector);

CREATE INDEX IF NOT EXISTS idx_sources_search_vector
  ON public.trusted_sources
  USING gin (search_vector);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scholarly_sources'
      AND column_name = 'search_vector'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_scholarly_sources_search_vector
      ON public.scholarly_sources
      USING gin (search_vector);
  END IF;
END $$;

-- ─── 7. Compatibility views ──────────────────────────────────────────
CREATE OR REPLACE VIEW public.hadiths AS
  SELECT
    id, collection, hadith_number, title, text, narrator, scholar,
    source_name, source_url, grade, chapter, keywords, explanation,
    authenticity_class, verification_status, quality_score, trust_level,
    metadata, deleted_at, created_at, updated_at,
    search_text, search_vector
  FROM public.verified_hadith_items;

COMMENT ON VIEW public.hadiths IS
  'Spec alias: hadiths = verified_hadith_items (explicit columns, no SELECT *)';

CREATE OR REPLACE VIEW public.sources AS
  SELECT
    id, name, category, source_type, url, trust_level, is_active,
    last_synced_at, created_at, search_text, search_vector
  FROM public.trusted_sources;

COMMENT ON VIEW public.sources IS
  'Spec alias: sources = trusted_sources (explicit columns)';

-- ─── 8. Drop prior RPC signatures (return type change) ───────────────
DROP FUNCTION IF EXISTS public.search_hadiths(text, int);
DROP FUNCTION IF EXISTS public.search_hadith_items(text, int);
DROP FUNCTION IF EXISTS public.search_sources(text, int);

-- ─── 9. search_hadiths — ranked + filters + keyset ───────────────────
CREATE OR REPLACE FUNCTION public.search_hadiths(
  q text DEFAULT NULL,
  lim int DEFAULT 20,
  p_collection text DEFAULT NULL,
  p_chapter text DEFAULT NULL,
  p_authenticity_class text DEFAULT NULL,
  p_source_name text DEFAULT NULL,
  p_narrator text DEFAULT NULL,
  p_cursor_score double precision DEFAULT NULL,
  p_cursor_id text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  title text,
  text_snippet text,
  narrator text,
  source_name text,
  collection text,
  chapter text,
  hadith_number text,
  grade text,
  authenticity_class text,
  matched_field text,
  relevance_score double precision,
  cursor_score double precision,
  cursor_id text
)
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      public.ar_normalize(nullif(btrim(coalesce(q, '')), '')) AS qn,
      greatest(1, least(coalesce(lim, 20), 100)) AS lim_n,
      nullif(btrim(coalesce(p_collection, '')), '') AS f_collection,
      nullif(btrim(coalesce(p_chapter, '')), '') AS f_chapter,
      nullif(btrim(coalesce(p_authenticity_class, '')), '') AS f_auth,
      public.ar_normalize(nullif(btrim(coalesce(p_source_name, '')), '')) AS f_source,
      public.ar_normalize(nullif(btrim(coalesce(p_narrator, '')), '')) AS f_narrator,
      p_cursor_score AS c_score,
      nullif(btrim(coalesce(p_cursor_id, '')), '') AS c_id
  ),
  scored AS (
    SELECT
      h.id,
      h.title,
      left(h.text, 220) AS text_snippet,
      h.narrator,
      h.source_name,
      h.collection,
      h.chapter,
      h.hadith_number,
      h.grade,
      h.authenticity_class,
      CASE
        WHEN p.qn IS NOT NULL AND public.ar_normalize(h.title) = p.qn THEN 'title_exact'
        WHEN p.qn IS NOT NULL AND public.ar_normalize(h.hadith_number) = p.qn THEN 'hadith_number'
        WHEN p.qn IS NOT NULL AND public.ar_normalize(h.title) LIKE p.qn || '%' THEN 'title_prefix'
        WHEN p.qn IS NOT NULL AND public.ar_normalize(h.narrator) = p.qn THEN 'narrator_exact'
        WHEN p.qn IS NOT NULL AND public.ar_normalize(h.source_name) = p.qn THEN 'source_name_exact'
        WHEN p.qn IS NOT NULL AND h.search_vector @@ plainto_tsquery('simple', p.qn) THEN 'fts'
        WHEN p.qn IS NOT NULL AND coalesce(h.search_text, '') % p.qn THEN 'trgm'
        ELSE 'filter'
      END AS matched_field,
      (
        CASE WHEN p.qn IS NULL THEN 0::float8
        ELSE
          (CASE WHEN public.ar_normalize(h.title) = p.qn THEN 1000 ELSE 0 END)
          + (CASE WHEN public.ar_normalize(h.hadith_number) = p.qn THEN 900 ELSE 0 END)
          + (CASE WHEN public.ar_normalize(h.title) LIKE p.qn || '%' THEN 700 ELSE 0 END)
          + (CASE WHEN public.ar_normalize(h.narrator) = p.qn THEN 500 ELSE 0 END)
          + (CASE WHEN public.ar_normalize(h.source_name) = p.qn THEN 450 ELSE 0 END)
          + (CASE WHEN h.search_vector @@ plainto_tsquery('simple', p.qn)
                  THEN 200 * coalesce(ts_rank_cd(h.search_vector, plainto_tsquery('simple', p.qn)), 0)
                  ELSE 0 END)
          + (100 * greatest(
                coalesce(similarity(coalesce(h.search_text, ''), p.qn), 0),
                coalesce(similarity(public.ar_normalize(h.title), p.qn), 0),
                coalesce(similarity(public.ar_normalize(h.narrator), p.qn), 0),
                coalesce(similarity(public.ar_normalize(h.source_name), p.qn), 0)
              ))
        END
      )::float8 AS relevance_score
    FROM public.verified_hadith_items h
    CROSS JOIN params p
    WHERE h.deleted_at IS NULL
      AND h.verification_status = 'verified'
      AND (
        p.qn IS NOT NULL
        OR p.f_collection IS NOT NULL
        OR p.f_chapter IS NOT NULL
        OR p.f_auth IS NOT NULL
        OR p.f_source IS NOT NULL
        OR p.f_narrator IS NOT NULL
      )
      AND (p.f_collection IS NULL OR h.collection = p.f_collection)
      AND (p.f_chapter IS NULL OR h.chapter = p.f_chapter)
      AND (p.f_auth IS NULL OR h.authenticity_class = p.f_auth)
      AND (p.f_source IS NULL OR public.ar_normalize(h.source_name) = p.f_source)
      AND (p.f_narrator IS NULL OR public.ar_normalize(h.narrator) = p.f_narrator)
      AND (
        p.qn IS NULL
        OR (
          char_length(p.qn) < 2
          AND (
            public.ar_normalize(h.title) = p.qn
            OR public.ar_normalize(h.hadith_number) = p.qn
          )
        )
        OR (
          char_length(p.qn) >= 2
          AND (
            h.search_vector @@ plainto_tsquery('simple', p.qn)
            OR coalesce(h.search_text, '') % p.qn
            OR public.ar_normalize(h.title) % p.qn
            OR public.ar_normalize(h.narrator) % p.qn
            OR public.ar_normalize(h.source_name) % p.qn
            OR public.ar_normalize(h.title) LIKE p.qn || '%'
            OR public.ar_normalize(h.hadith_number) = p.qn
          )
        )
      )
  )
  SELECT
    s.id,
    s.title,
    s.text_snippet,
    s.narrator,
    s.source_name,
    s.collection,
    s.chapter,
    s.hadith_number,
    s.grade,
    s.authenticity_class,
    s.matched_field,
    s.relevance_score,
    s.relevance_score AS cursor_score,
    s.id AS cursor_id
  FROM scored s
  CROSS JOIN params p
  WHERE
    p.c_score IS NULL OR p.c_id IS NULL
    OR (s.relevance_score < p.c_score)
    OR (s.relevance_score = p.c_score AND s.id > p.c_id)
  ORDER BY s.relevance_score DESC, s.id ASC
  LIMIT (SELECT lim_n FROM params);
$$;

-- Compatibility alias
CREATE OR REPLACE FUNCTION public.search_hadith_items(
  q text DEFAULT NULL,
  lim int DEFAULT 20
)
RETURNS TABLE (
  id text,
  title text,
  text_snippet text,
  narrator text,
  source_name text,
  collection text,
  chapter text,
  hadith_number text,
  grade text,
  authenticity_class text,
  matched_field text,
  relevance_score double precision,
  cursor_score double precision,
  cursor_id text
)
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM public.search_hadiths(q, lim, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
$$;

-- ─── 10. search_sources — ranked + filters + keyset ──────────────────
CREATE OR REPLACE FUNCTION public.search_sources(
  q text DEFAULT NULL,
  lim int DEFAULT 20,
  p_category text DEFAULT NULL,
  p_source_type text DEFAULT NULL,
  p_cursor_score double precision DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  source_type text,
  url text,
  trust_level integer,
  matched_field text,
  relevance_score double precision,
  cursor_score double precision,
  cursor_id uuid
)
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      public.ar_normalize(nullif(btrim(coalesce(q, '')), '')) AS qn,
      greatest(1, least(coalesce(lim, 20), 100)) AS lim_n,
      nullif(btrim(coalesce(p_category, '')), '') AS f_category,
      nullif(btrim(coalesce(p_source_type, '')), '') AS f_type,
      p_cursor_score AS c_score,
      p_cursor_id AS c_id
  ),
  scored AS (
    SELECT
      s.id,
      s.name,
      s.category,
      s.source_type,
      s.url,
      s.trust_level,
      CASE
        WHEN p.qn IS NOT NULL AND public.ar_normalize(s.name) = p.qn THEN 'name_exact'
        WHEN p.qn IS NOT NULL AND public.ar_normalize(s.name) LIKE p.qn || '%' THEN 'name_prefix'
        WHEN p.qn IS NOT NULL AND s.search_vector @@ plainto_tsquery('simple', p.qn) THEN 'fts'
        WHEN p.qn IS NOT NULL AND coalesce(s.search_text, '') % p.qn THEN 'trgm'
        ELSE 'filter'
      END AS matched_field,
      (
        CASE WHEN p.qn IS NULL THEN 0::float8
        ELSE
          (CASE WHEN public.ar_normalize(s.name) = p.qn THEN 1000 ELSE 0 END)
          + (CASE WHEN public.ar_normalize(s.name) LIKE p.qn || '%' THEN 700 ELSE 0 END)
          + (CASE WHEN s.search_vector @@ plainto_tsquery('simple', p.qn)
                  THEN 200 * coalesce(ts_rank_cd(s.search_vector, plainto_tsquery('simple', p.qn)), 0)
                  ELSE 0 END)
          + (100 * greatest(
                coalesce(similarity(coalesce(s.search_text, ''), p.qn), 0),
                coalesce(similarity(public.ar_normalize(s.name), p.qn), 0)
              ))
        END
      )::float8 AS relevance_score
    FROM public.trusted_sources s
    CROSS JOIN params p
    WHERE coalesce(s.is_active, true) = true
      AND (p.f_category IS NULL OR s.category = p.f_category)
      AND (p.f_type IS NULL OR s.source_type = p.f_type)
      AND (
        p.qn IS NULL
        OR char_length(p.qn) < 2 AND public.ar_normalize(s.name) = p.qn
        OR char_length(p.qn) >= 2 AND (
          s.search_vector @@ plainto_tsquery('simple', p.qn)
          OR coalesce(s.search_text, '') % p.qn
          OR public.ar_normalize(s.name) % p.qn
          OR public.ar_normalize(s.name) LIKE p.qn || '%'
        )
      )
  )
  SELECT
    s.id,
    s.name,
    s.category,
    s.source_type,
    s.url,
    s.trust_level,
    s.matched_field,
    s.relevance_score,
    s.relevance_score AS cursor_score,
    s.id AS cursor_id
  FROM scored s
  CROSS JOIN params p
  WHERE
    p.c_score IS NULL OR p.c_id IS NULL
    OR (s.relevance_score < p.c_score)
    OR (s.relevance_score = p.c_score AND s.id > p.c_id)
  ORDER BY s.relevance_score DESC, s.id ASC
  LIMIT (SELECT lim_n FROM params);
$$;

GRANT SELECT ON public.hadiths TO anon, authenticated, service_role;
GRANT SELECT ON public.sources TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_hadiths(text, int, text, text, text, text, text, double precision, text)
  TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_hadith_items(text, int)
  TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_sources(text, int, text, text, double precision, uuid)
  TO anon, authenticated, service_role;

-- ─── 11. Local self-check (non-production fixtures via SELECT) ───────
-- SELECT public.ar_normalize('القُرآن');      -- القران
-- SELECT public.ar_normalize('إسلام');        -- اسلام
-- SELECT public.ar_normalize('الأذكار');      -- الاذكار
-- SELECT public.ar_normalize('مسؤول') = public.ar_normalize('مسئول'); -- t
-- SELECT public.ar_normalize('فتاوى');        -- فتاوي
-- SELECT public.ar_normalize('نـــصٌ   مُكَرَّر'); -- نص مكرر
