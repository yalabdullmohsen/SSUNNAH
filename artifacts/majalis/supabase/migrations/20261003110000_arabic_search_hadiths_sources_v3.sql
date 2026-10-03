-- ====================================================================
--  سُنّة — فهارس بحث عربية للأحاديث والمصادر (v3)
--  يعتمد على public.ar_normalize من arabic_search_infrastructure_v2.sql
--
--  الجداول الفعلية في سُنّة:
--    hadiths  → public.verified_hadith_items
--    sources  → public.trusted_sources (+ scholarly_sources إن وُجد)
--  إن وُجدت جداول باسم hadiths/sources حرفياً تُغطّى أيضاً.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ضمان وجود ar_normalize (idempotent)
CREATE OR REPLACE FUNCTION public.ar_normalize(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT trim(both FROM regexp_replace(
    regexp_replace(
      translate(
        lower(
          regexp_replace(
            regexp_replace(coalesce(input, ''), 'ئو', 'وو', 'g'),
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

ALTER FUNCTION public.ar_normalize(text) SET search_path = public;

-- ═══════════════════════════════════════════════════════════════════
--  HADITHS → verified_hadith_items
-- ═══════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items'
  ) THEN
    RAISE NOTICE 'verified_hadith_items missing — skip hadith indexes';
    RETURN;
  END IF;

  -- فهارس العنوان والراوي (أسماء idx_hadiths_* كما في المواصفة)
  CREATE INDEX IF NOT EXISTS idx_hadiths_title_trgm
    ON public.verified_hadith_items
    USING gin (public.ar_normalize(coalesce(title, '')) gin_trgm_ops);

  CREATE INDEX IF NOT EXISTS idx_hadiths_narrator_trgm
    ON public.verified_hadith_items
    USING gin (public.ar_normalize(coalesce(narrator, '')) gin_trgm_ops);

  -- search_text موحّد: title + narrator + source_name + text (+ collection)
  -- إن وُجد عمود مولَّد قديم بتعبير أضيق: نستبدله بأمان
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items'
      AND column_name = 'search_text'
  ) THEN
    -- أعد التعريف فقط إن لم يكن search_vector معتمداً عليه كمولَّد
    -- نضيف search_blob موازياً إن تعذّر الإسقاط
    BEGIN
      ALTER TABLE public.verified_hadith_items DROP COLUMN IF EXISTS search_text CASCADE;
    EXCEPTION WHEN dependent_objects_still_exist OR feature_not_supported THEN
      NULL;
    END;
  END IF;

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
            coalesce(narrator, ''),
            coalesce(source_name, ''),
            coalesce(collection, ''),
            coalesce(text, '')
          )
        )
      ) STORED;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_hadiths_search_trgm
    ON public.verified_hadith_items
    USING gin (search_text gin_trgm_ops);

  -- search_vector
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items'
      AND column_name = 'search_vector'
  ) THEN
    BEGIN
      ALTER TABLE public.verified_hadith_items DROP COLUMN IF EXISTS search_vector CASCADE;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items'
      AND column_name = 'search_vector'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verified_hadith_items'
      AND column_name = 'search_text'
  ) THEN
    ALTER TABLE public.verified_hadith_items
      ADD COLUMN search_vector tsvector
      GENERATED ALWAYS AS (
        to_tsvector('simple', coalesce(search_text, ''))
      ) STORED;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_hadiths_search_vector
    ON public.verified_hadith_items
    USING gin (search_vector);
END $$;

-- جدول hadiths الحرفي إن وُجد (بيئات أخرى)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'hadiths'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_hadiths_literal_title_trgm
      ON public.hadiths USING gin (public.ar_normalize(coalesce(title, '')) gin_trgm_ops);

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='hadiths' AND column_name='narrator'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_hadiths_literal_narrator_trgm
        ON public.hadiths USING gin (public.ar_normalize(coalesce(narrator, '')) gin_trgm_ops);
    END IF;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
--  SOURCES → trusted_sources (+ scholarly_sources)
-- ═══════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'trusted_sources'
  ) THEN
    RAISE NOTICE 'trusted_sources missing — skip sources indexes';
  ELSE
    CREATE INDEX IF NOT EXISTS idx_sources_name_trgm
      ON public.trusted_sources
      USING gin (public.ar_normalize(name) gin_trgm_ops);

    -- description قد لا يوجد — فهرس category بدلًا منه عند الغياب
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='trusted_sources' AND column_name='description'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_sources_description_trgm
        ON public.trusted_sources
        USING gin (public.ar_normalize(description) gin_trgm_ops);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='trusted_sources' AND column_name='category'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_sources_category_trgm
        ON public.trusted_sources
        USING gin (public.ar_normalize(coalesce(category, '')) gin_trgm_ops);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='trusted_sources' AND column_name='search_text'
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

    CREATE INDEX IF NOT EXISTS idx_sources_search_trgm
      ON public.trusted_sources
      USING gin (search_text gin_trgm_ops);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='trusted_sources' AND column_name='search_vector'
    ) THEN
      ALTER TABLE public.trusted_sources
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector('simple', coalesce(search_text, ''))
        ) STORED;
    END IF;

    CREATE INDEX IF NOT EXISTS idx_sources_search_vector
      ON public.trusted_sources
      USING gin (search_vector);
  END IF;
END $$;

-- scholarly_sources (سجل مصادر علمي موازٍ)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='scholarly_sources'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_scholarly_sources_name_trgm
      ON public.scholarly_sources
      USING gin (public.ar_normalize(name) gin_trgm_ops);

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='scholarly_sources' AND column_name='name_ar'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_scholarly_sources_name_ar_trgm
        ON public.scholarly_sources
        USING gin (public.ar_normalize(coalesce(name_ar, '')) gin_trgm_ops);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='scholarly_sources' AND column_name='search_text'
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

    CREATE INDEX IF NOT EXISTS idx_scholarly_sources_search_trgm
      ON public.scholarly_sources USING gin (search_text gin_trgm_ops);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='scholarly_sources' AND column_name='search_vector'
    ) THEN
      ALTER TABLE public.scholarly_sources
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector('simple', coalesce(search_text, ''))
        ) STORED;
    END IF;

    CREATE INDEX IF NOT EXISTS idx_scholarly_sources_search_vector
      ON public.scholarly_sources USING gin (search_vector);
  END IF;
END $$;

-- جدول sources الحرفي إن وُجد
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='sources'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_sources_literal_name_trgm
      ON public.sources USING gin (public.ar_normalize(coalesce(name, '')) gin_trgm_ops);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
--  Views توافقية (أسماء المواصفة → جداول سُنّة)
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.hadiths AS
  SELECT * FROM public.verified_hadith_items;

COMMENT ON VIEW public.hadiths IS
  'توافق مواصفة البحث: hadiths = verified_hadith_items';

CREATE OR REPLACE VIEW public.sources AS
  SELECT
    id,
    name,
    category,
    source_type,
    url,
    trust_level,
    is_active,
    search_text,
    search_vector,
    created_at
  FROM public.trusted_sources;

COMMENT ON VIEW public.sources IS
  'توافق مواصفة البحث: sources = trusted_sources';

-- ═══════════════════════════════════════════════════════════════════
--  RPCs هجينة
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.search_hadiths(q text, lim int DEFAULT 20)
RETURNS SETOF public.verified_hadith_items
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = public
AS $$
  WITH n AS (SELECT public.ar_normalize(q) AS qn)
  SELECT h.*
  FROM public.verified_hadith_items h, n
  WHERE n.qn <> ''
    AND coalesce(h.deleted_at, 'infinity'::timestamptz) = 'infinity'::timestamptz
    AND (
      (h.search_vector IS NOT NULL AND h.search_vector @@ plainto_tsquery('simple', n.qn))
      OR (h.search_text IS NOT NULL AND h.search_text % n.qn)
      OR public.ar_normalize(coalesce(h.title, '')) % n.qn
      OR public.ar_normalize(coalesce(h.narrator, '')) % n.qn
    )
  ORDER BY
    greatest(
      coalesce(similarity(coalesce(h.search_text, ''), n.qn), 0),
      coalesce(similarity(public.ar_normalize(coalesce(h.title, '')), n.qn), 0),
      coalesce(similarity(public.ar_normalize(coalesce(h.narrator, '')), n.qn), 0)
    ) DESC
  LIMIT greatest(1, least(coalesce(lim, 20), 100));
$$;

-- توافق مع الاسم السابق
CREATE OR REPLACE FUNCTION public.search_hadith_items(q text, lim int DEFAULT 20)
RETURNS SETOF public.verified_hadith_items
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT * FROM public.search_hadiths(q, lim);
$$;

CREATE OR REPLACE FUNCTION public.search_sources(q text, lim int DEFAULT 20)
RETURNS SETOF public.trusted_sources
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = public
AS $$
  WITH n AS (SELECT public.ar_normalize(q) AS qn)
  SELECT s.*
  FROM public.trusted_sources s, n
  WHERE n.qn <> ''
    AND coalesce(s.is_active, true) = true
    AND (
      (s.search_vector IS NOT NULL AND s.search_vector @@ plainto_tsquery('simple', n.qn))
      OR (s.search_text IS NOT NULL AND s.search_text % n.qn)
      OR public.ar_normalize(s.name) % n.qn
    )
  ORDER BY
    greatest(
      coalesce(similarity(coalesce(s.search_text, ''), n.qn), 0),
      coalesce(similarity(public.ar_normalize(s.name), n.qn), 0)
    ) DESC
  LIMIT greatest(1, least(coalesce(lim, 20), 100));
$$;

GRANT SELECT ON public.hadiths TO anon, authenticated, service_role;
GRANT SELECT ON public.sources TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_hadiths(text, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_hadith_items(text, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_sources(text, int) TO anon, authenticated, service_role;
