-- فهرسة المفاتيح الأجنبية في public التي لا يغطيها أي فهرس صالح (تحذير unindexed_foreign_keys).
-- ديناميكي وidempotent: يحسب المفاتيح غير المفهرسة وقت التنفيذ وينشئ فهرسًا بأعمدة المفتاح نفسها.
-- (CREATE INDEX عادي لا CONCURRENTLY لأن الهجرة داخل معاملة؛ أكبر جدول ≈78MB فالقفل ثوانٍ قليلة.)
DO $$
DECLARE r record; idx text; cols text;
BEGIN
  FOR r IN
    SELECT c.oid AS conid, c.conrelid, c.conkey, cl.relname AS tbl
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE c.contype = 'f' AND n.nspname = 'public' AND cl.relkind IN ('r','p')
      AND NOT EXISTS (
        SELECT 1 FROM pg_index i
        WHERE i.indrelid = c.conrelid AND i.indisvalid
          AND (i.indkey::int2[])[0:array_length(c.conkey,1)-1] @> c.conkey)
  LOOP
    SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY k.ord),
           left(string_agg(a.attname, '_' ORDER BY k.ord), 30)
      INTO cols, idx
    FROM unnest(r.conkey) WITH ORDINALITY AS k(attnum, ord)
    JOIN pg_attribute a ON a.attrelid = r.conrelid AND a.attnum = k.attnum;
    idx := left('idx_' || r.tbl || '_' || idx, 50) || '_' || substr(md5(r.conid::text), 1, 8);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (%s)', idx, r.tbl, cols);
  END LOOP;
END $$;
