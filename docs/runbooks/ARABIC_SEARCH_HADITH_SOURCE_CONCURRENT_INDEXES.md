# Runbook — Concurrent indexes for Hadith/Source Arabic search (v4)

Status: **REQUIRES_EXPLICIT_APPROVAL** before Production.

## When to use

`supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql` creates indexes inside a migration transaction (`CREATE INDEX IF NOT EXISTS` without `CONCURRENTLY`).

On large live tables, prefer this runbook **outside** a transaction.

## Preconditions

1. Owner written approval recorded (ticket / chat / PR comment).
2. Staging apply succeeded.
3. `pg_trgm` available.
4. Maintenance window or low-traffic window preferred.
5. Monitor disk for index build.

## Steps (Staging → Production)

```sql
-- 1) Extensions + function (transaction OK)
\i artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4.sql
-- OR apply generated columns / functions from migration, then indexes via concurrent below.
```

For Production large indexes only (each statement autocommit, not inside BEGIN):

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hadiths_title_trgm
  ON public.verified_hadith_items
  USING gin (public.ar_normalize(title) gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hadiths_narrator_trgm
  ON public.verified_hadith_items
  USING gin (public.ar_normalize(narrator) gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hadiths_source_name_trgm
  ON public.verified_hadith_items
  USING gin (public.ar_normalize(source_name) gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hadiths_search_trgm
  ON public.verified_hadith_items
  USING gin (search_text gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hadiths_search_vector
  ON public.verified_hadith_items
  USING gin (search_vector);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hadith_rel_verified_auth_collection
  ON public.verified_hadith_items (authenticity_class, collection, hadith_number, id)
  WHERE verification_status = 'verified' AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hadith_rel_verified_collection_chapter
  ON public.verified_hadith_items (collection, chapter, hadith_number, id)
  WHERE verification_status = 'verified' AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sources_name_trgm
  ON public.trusted_sources
  USING gin (public.ar_normalize(name) gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sources_search_trgm
  ON public.trusted_sources
  USING gin (search_text gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sources_search_vector
  ON public.trusted_sources
  USING gin (search_vector);
```

## Post-checks

```sql
SELECT indexrelid::regclass AS idx, indisvalid, indisready
FROM pg_index
WHERE indexrelid::regclass::text LIKE 'idx_hadith%'
   OR indexrelid::regclass::text LIKE 'idx_sources%'
   OR indexrelid::regclass::text LIKE 'idx_trusted_sources%'
   OR indexrelid::regclass::text LIKE 'idx_scholarly_sources%';
```

Any `indisvalid = false` → rebuild or drop invalid index.

## Rollback

See `artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4_rollback.sql`.

Do not drop a live index until `pg_stat_user_indexes` shows no meaningful scans / replacement proven.

## Forbidden

- Auto-apply to Production without owner approval.
- Heavy `EXPLAIN ANALYZE` on Production for full-table scans.
