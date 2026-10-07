-- ====================================================================
--  سُنّة — ARABIC_SEARCH_INFRASTRUCTURE_HARDENING (v2)
--  2026-10-03 · PR search-excellence-wave
-- ====================================================================
--  1) public.ar_normalize() — سلطة تطبيع SQL (متوافقة مع TS قدر الإمكان)
--  2) normalize_ar() → غلاف توافق يستدعي ar_normalize
--  3) pg_trgm
--  4) search_vector (FTS simple على النص المطبع)
--  5) دوال بحث هجينة: FTS + trigram similarity
--
--  ملاحظة: لا CONCURRENTLY داخل ترحيل معاملاتي.
--  بعد النشر: أعد حساب الأعمدة المولَّدة عبر لمس الأعمدة المصدر
--    UPDATE lessons SET title = title WHERE title IS NOT NULL;
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── 1. ar_normalize — سلطة SQL ─────────────────────────────────────
-- يطابق مسار العميل (@/shared/arabic-normalize) في القواعد الأساسية:
--   ئو→وو · أإآٱ→ا · ؤ→و · ئى→ي · ة→ه · ء تُحذف · ک→ك · تشكيل/كشيدة
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
            -- ئو قبل تحويل ئ (مسئول ≡ مسؤول)
            regexp_replace(coalesce(input, ''), 'ئو', 'وو', 'g'),
            -- تشكيل + مدّات + وقف قرآني + كشيدة + حروف عالية
            E'[ً-ٟٓ-ٕؐ-ؚۖ-ۜ۟-ۤۧ-ٰۭـ]',
            '',
            'g'
          )
        ),
        -- أ إ آ ٱ ة ى ؤ ئ ک
        E'أإآٱةىؤئک',
        E'ااااهيويك'
      ),
      -- همزة مفردة
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
  'تطبيع عربي موحّد للبحث/الفهرسة فقط — لا يُستخدم لعرض النص العثماني';

-- توافق خلفي: كل المستهلكين القدامى (search_text / search_ar / search_content)
CREATE OR REPLACE FUNCTION public.normalize_ar(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT public.ar_normalize(input);
$$;

ALTER FUNCTION public.ar_normalize(text) SET search_path = public;
ALTER FUNCTION public.normalize_ar(text) SET search_path = public;

-- ─── 2. أمثلة تحقّق (تعليق توثيقي — تُشغَّل يدوياً) ────────────────
-- SELECT public.ar_normalize('القُرآن');   -- القران
-- SELECT public.ar_normalize('إسلام');     -- اسلام
-- SELECT public.ar_normalize('فتاوى');     -- فتاوي
-- SELECT public.ar_normalize('مسئول') = public.ar_normalize('مسؤول'); -- t

-- ─── 3. search_vector على الكيانات القابلة للبحث ───────────────────
-- يعتمد على search_text إن وُجد (مولَّد عبر normalize_ar/ar_normalize)

-- lessons
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='lessons')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='lessons' AND column_name='search_text')
  THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='lessons' AND column_name='search_vector'
    ) THEN
      ALTER TABLE public.lessons
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector('simple', coalesce(search_text, ''))
        ) STORED;
    END IF;
    CREATE INDEX IF NOT EXISTS idx_lessons_search_vector
      ON public.lessons USING GIN (search_vector);
    CREATE INDEX IF NOT EXISTS idx_lessons_title_ar_trgm
      ON public.lessons USING GIN (public.ar_normalize(title) gin_trgm_ops);
  END IF;
END $$;

-- sheikhs (علماء)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sheikhs')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sheikhs' AND column_name='search_text')
  THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='sheikhs' AND column_name='search_vector'
    ) THEN
      ALTER TABLE public.sheikhs
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector('simple', coalesce(search_text, ''))
        ) STORED;
    END IF;
    CREATE INDEX IF NOT EXISTS idx_sheikhs_search_vector
      ON public.sheikhs USING GIN (search_vector);
    CREATE INDEX IF NOT EXISTS idx_scholars_name_trgm
      ON public.sheikhs USING GIN (public.ar_normalize(name) gin_trgm_ops);
  END IF;
END $$;

-- library_items (كتب/مصادر مكتبية)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='library_items')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='library_items' AND column_name='search_text')
  THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='library_items' AND column_name='search_vector'
    ) THEN
      ALTER TABLE public.library_items
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector('simple', coalesce(search_text, ''))
        ) STORED;
    END IF;
    CREATE INDEX IF NOT EXISTS idx_books_search_vector
      ON public.library_items USING GIN (search_vector);
    CREATE INDEX IF NOT EXISTS idx_books_title_trgm
      ON public.library_items USING GIN (public.ar_normalize(title) gin_trgm_ops);
  END IF;
END $$;

-- verified_hadith_items
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='verified_hadith_items')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verified_hadith_items' AND column_name='search_text')
  THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='verified_hadith_items' AND column_name='search_vector'
    ) THEN
      ALTER TABLE public.verified_hadith_items
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          to_tsvector('simple', coalesce(search_text, ''))
        ) STORED;
    END IF;
    CREATE INDEX IF NOT EXISTS idx_hadith_search_vector
      ON public.verified_hadith_items USING GIN (search_vector);
    CREATE INDEX IF NOT EXISTS idx_hadith_title_trgm
      ON public.verified_hadith_items USING GIN (public.ar_normalize(title) gin_trgm_ops);
  END IF;
END $$;

-- مصادر: فهرس trgm على name إن وُجد العمود
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='trusted_sources' AND column_name='name'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_sources_name_trgm
      ON public.trusted_sources USING GIN (public.ar_normalize(name) gin_trgm_ops);
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='scholarly_sources' AND column_name='name'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_sources_name_trgm
      ON public.scholarly_sources USING GIN (public.ar_normalize(name) gin_trgm_ops);
  END IF;
END $$;

-- ─── 4. دوال البحث الهجينة (FTS + trigram) ─────────────────────────

-- FIX (R2): created only when lessons.search_text/search_vector exist
-- (production has neither; an unconditional CREATE fails with 42703).
DO $wrap$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='lessons' AND column_name='search_text')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='lessons' AND column_name='search_vector') THEN
    EXECUTE $fn$
CREATE OR REPLACE FUNCTION public.search_lessons(q text, lim int DEFAULT 20)
RETURNS SETOF public.lessons
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  WITH n AS (SELECT public.ar_normalize(q) AS qn)
  SELECT l.*
  FROM public.lessons l, n
  WHERE n.qn <> ''
    AND (
      (l.search_vector IS NOT NULL AND l.search_vector @@ plainto_tsquery('simple', n.qn))
      OR (l.search_text IS NOT NULL AND l.search_text % n.qn)
      OR public.ar_normalize(l.title) % n.qn
    )
  ORDER BY
    greatest(
      coalesce(similarity(coalesce(l.search_text, ''), n.qn), 0),
      coalesce(similarity(public.ar_normalize(l.title), n.qn), 0)
    ) DESC,
    l.updated_at DESC NULLS LAST
  LIMIT greatest(1, least(coalesce(lim, 20), 100));
$$;
    $fn$;
    EXECUTE 'ALTER FUNCTION public.search_lessons(text, int) SET search_path = public';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.search_lessons(text, int) TO anon, authenticated, service_role';
  END IF;
END $wrap$;

DO $wrap$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sheikhs' AND column_name='search_text')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sheikhs' AND column_name='search_vector') THEN
    EXECUTE $fn$
CREATE OR REPLACE FUNCTION public.search_sheikhs(q text, lim int DEFAULT 20)
RETURNS SETOF public.sheikhs
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  WITH n AS (SELECT public.ar_normalize(q) AS qn)
  SELECT s.*
  FROM public.sheikhs s, n
  WHERE n.qn <> ''
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
    $fn$;
    EXECUTE $fn$
CREATE OR REPLACE FUNCTION public.search_scholars(q text, lim int DEFAULT 20)
RETURNS SETOF public.sheikhs
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT * FROM public.search_sheikhs(q, lim);
$$;
    $fn$;
    EXECUTE 'ALTER FUNCTION public.search_sheikhs(text, int) SET search_path = public';
    EXECUTE 'ALTER FUNCTION public.search_scholars(text, int) SET search_path = public';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.search_sheikhs(text, int) TO anon, authenticated, service_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.search_scholars(text, int) TO anon, authenticated, service_role';
  END IF;
END $wrap$;

DO $wrap$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='library_items' AND column_name='search_text')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='library_items' AND column_name='search_vector') THEN
    EXECUTE $fn$
CREATE OR REPLACE FUNCTION public.search_library_items(q text, lim int DEFAULT 20)
RETURNS SETOF public.library_items
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  WITH n AS (SELECT public.ar_normalize(q) AS qn)
  SELECT b.*
  FROM public.library_items b, n
  WHERE n.qn <> ''
    AND (
      (b.search_vector IS NOT NULL AND b.search_vector @@ plainto_tsquery('simple', n.qn))
      OR (b.search_text IS NOT NULL AND b.search_text % n.qn)
      OR public.ar_normalize(b.title) % n.qn
    )
  ORDER BY
    greatest(
      coalesce(similarity(coalesce(b.search_text, ''), n.qn), 0),
      coalesce(similarity(public.ar_normalize(b.title), n.qn), 0)
    ) DESC
  LIMIT greatest(1, least(coalesce(lim, 20), 100));
$$;
    $fn$;
    EXECUTE 'ALTER FUNCTION public.search_library_items(text, int) SET search_path = public';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.search_library_items(text, int) TO anon, authenticated, service_role';
  END IF;
END $wrap$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verified_hadith_items' AND column_name='search_text')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verified_hadith_items' AND column_name='search_vector') THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.search_hadith_items(q text, lim int DEFAULT 20)
      RETURNS SETOF public.verified_hadith_items
      LANGUAGE sql
      STABLE
      PARALLEL SAFE
      AS $body$
        WITH n AS (SELECT public.ar_normalize(q) AS qn)
        SELECT h.*
        FROM public.verified_hadith_items h, n
        WHERE n.qn <> ''
          AND (
            (h.search_vector IS NOT NULL AND h.search_vector @@ plainto_tsquery('simple', n.qn))
            OR (h.search_text IS NOT NULL AND h.search_text % n.qn)
            OR public.ar_normalize(coalesce(h.title, '')) % n.qn
          )
        ORDER BY
          greatest(
            coalesce(similarity(coalesce(h.search_text, ''), n.qn), 0),
            coalesce(similarity(public.ar_normalize(coalesce(h.title, '')), n.qn), 0)
          ) DESC
        LIMIT greatest(1, least(coalesce(lim, 20), 100));
      $body$;
    $fn$;
    EXECUTE 'ALTER FUNCTION public.search_hadith_items(text, int) SET search_path = public';
  END IF;
END $$;


-- ─── 5. ترقية search_content لاستخدام FTS+تشابه عند الإمكان ────────
-- نحافظ على التوقيع؛ نستبدل فرع الدروس بمسار هجين ونُبقي البقية متوافقة.
-- FIX (R2): only real production columns (no lessons/qa search_text/search_vector,
-- no library_items.author_name), lessons.status is enum content_status
-- ('published' is not a label), SECURITY INVOKER so RLS applies (the definer
-- version exposed unapproved library items and draft Q&A).
CREATE OR REPLACE FUNCTION public.search_content(
  p_query        text,
  p_types        text[]   DEFAULT ARRAY['lesson','library','hadith','fatwa','qa','fawaid','miracle','story','fiqh'],
  p_limit        integer  DEFAULT 20,
  p_offset       integer  DEFAULT 0
)
RETURNS TABLE (
  id             text,
  content_type   text,
  title          text,
  summary        text,
  meta           text,
  href           text,
  score          numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
DECLARE
  v_norm     text;
  v_pattern  text;
BEGIN
  v_norm    := coalesce(public.ar_normalize(p_query), '');
  IF v_norm = '' THEN RETURN; END IF;
  v_pattern := '%' || v_norm || '%';

  IF 'lesson' = ANY(p_types) THEN
    RETURN QUERY
    SELECT
      l.id::text,
      'lesson'::text,
      l.title,
      COALESCE(l.description, '')::text,
      COALESCE(l.speaker_name, l.category, '')::text,
      ('/lessons/' || l.id)::text,
      coalesce(similarity(public.ar_normalize(l.title), v_norm), 0)::numeric
    FROM public.lessons l
    WHERE l.status = 'approved'
      AND (
        public.ar_normalize(l.title) % v_norm
        OR public.ar_normalize(concat_ws(' ', l.title, l.description, l.speaker_name, l.category)) ILIKE v_pattern
      )
    ORDER BY 7 DESC, l.updated_at DESC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
  END IF;

  IF 'library' = ANY(p_types) THEN
    RETURN QUERY
    SELECT
      b.id::text,
      'library'::text,
      b.title,
      COALESCE(b.description, '')::text,
      COALESCE(b.category, '')::text,
      ('/library/' || b.id)::text,
      coalesce(similarity(public.ar_normalize(b.title), v_norm), 0)::numeric
    FROM public.library_items b
    WHERE b.status = 'approved'
      AND (
        public.ar_normalize(b.title) % v_norm
        OR public.ar_normalize(concat_ws(' ', b.title, b.description, b.category)) ILIKE v_pattern
      )
    ORDER BY 7 DESC
    LIMIT p_limit OFFSET p_offset;
  END IF;

  IF 'qa' = ANY(p_types) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='qa_questions'
  ) THEN
    RETURN QUERY
    SELECT
      q.id::text,
      'qa'::text,
      q.question,
      left(coalesce(q.answer, ''), 240)::text,
      ''::text,
      ('/qa/' || q.id)::text,
      0.75::numeric
    FROM public.qa_questions q
    WHERE q.status = 'published'
      AND (
        public.ar_normalize(q.question) ILIKE v_pattern
        OR public.ar_normalize(q.question) % v_norm
      )
    LIMIT p_limit OFFSET p_offset;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ar_normalize(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.normalize_ar(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_content(text, text[], integer, integer) TO anon, authenticated, service_role;

-- FIX (R2): normalize_ar changed meaning (whitespace-only -> full Arabic
-- normalization). sharia_rulings.search_vector is trigger-built with
-- normalize_ar while search_sharia_rulings normalizes the query, so stored
-- vectors must be rebuilt or the rulings search regresses.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sharia_rulings_search_vector_trigger') THEN
    UPDATE public.sharia_rulings SET title = title;
  END IF;
END $$;
