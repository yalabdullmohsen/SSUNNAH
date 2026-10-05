-- ====================================================================
-- ARABIC_SEARCH_NORMALIZE_PARITY (v5) — additive, reversible
-- REQUIRES_EXPLICIT_APPROVAL before any Production apply.
-- Rollback: supabase/arabic_search_normalize_parity_v5_rollback.sql
--
-- Redefines ONLY public.ar_normalize(text) so it matches the client authority
-- src/shared/arabic-normalize.ts (normalizeArabic) step-for-step.
-- Gaps fixed vs v2/v3/v4:
--   * 'ئو'→'وو' ran BEFORE tashkeel removal → 'مسئُول' gave 'مسيول' (client: 'مسوول').
--   * missing: ٲ ٳ → ا, ی (Persian yeh) → ي, lam-alef ligatures → لا,
--     U+06E5/U+06E6 small waw/yeh, invisible chars (ZWSP/ZWNJ/BOM/bidi), NBSP,
--     Arabic-Indic/Persian digits → 0-9, separator punctuation → space.
-- Unchanged: tashkeel/tatweel removed; أإآٱ→ا, ؤ→و, ئ→ي, ى→ي, ة→ه, ء dropped.
--
-- The block between PARITY-STEPS-BEGIN/END is executed by the static gate
-- src/shared/arabic-normalize-sql-parity.test.ts against normalizeArabic():
-- keep ONE `s := ...;` statement per line.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.ar_normalize(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = public
AS $fn$
DECLARE
  s text := input;
BEGIN
  -- PARITY-STEPS-BEGIN
  s := regexp_replace(s, '[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]', '', 'g');
  s := regexp_replace(s, '\u00A0', ' ', 'g');
  s := translate(s, E'\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9', '01234567890123456789');
  s := regexp_replace(s, '[\u064B-\u065F\u0670\u0653-\u0655\u0616-\u061A\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06ED\u0610-\u061A\u06E5-\u06E6]', '', 'g');
  s := lower(s);
  s := regexp_replace(s, '[\uFEF5\uFEF7\uFEF9\uFEFB]', E'\u0644\u0627', 'g');
  s := translate(s, E'\u0623\u0625\u0622\u0671\u0672\u0673', E'\u0627\u0627\u0627\u0627\u0627\u0627');
  s := replace(s, E'\u0626\u0648', E'\u0648\u0648');
  s := translate(s, E'\u0624\u0649\u0626\u06CC\u0629\u06A9', E'\u0648\u064A\u064A\u064A\u0647\u0643');
  s := replace(s, E'\u0621', '');
  s := replace(s, E'\u0640', '');
  s := regexp_replace(s, '[,.;!?\u060C\u061B\u061F\u00AB\u00BB"''()\[\]{}\-\u2014\u2026]', ' ', 'g');
  s := regexp_replace(s, '(?<!\d):(?!\d)', ' ', 'g');
  s := regexp_replace(s, '\s+', ' ', 'g');
  s := btrim(s);
  -- PARITY-STEPS-END
  RETURN s;
END;
$fn$;

COMMENT ON FUNCTION public.ar_normalize(text) IS
  'Arabic search normalize only (IMMUTABLE STRICT). Step-for-step parity with src/shared/arabic-normalize.ts (v5). Display text must stay vocalized.';

-- normalize_ar wrapper (v2/v4) delegates to ar_normalize — no change needed.

-- ─── Rebuild everything that stored the old normalization ───────────
-- Expression indexes on ar_normalize(...) hold old outputs.
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

-- Trigger-maintained search_text/search_vector (v4): touch rows to refresh.
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
END $$;

-- Verification (manual):
-- SELECT public.ar_normalize('مسئُول') = public.ar_normalize('مسؤول');   -- t
-- SELECT public.ar_normalize('الصلاة') = public.ar_normalize('الصلاه');   -- t
-- SELECT public.ar_normalize('إبراهيم') = public.ar_normalize('أبراهيم'); -- t
-- SELECT public.ar_normalize('مُحَمَّـــد');                              -- محمد
-- SELECT public.ar_normalize('سورة ٢:٢٥٥');                            -- سوره 2:255
