# SEARCH_DB_MIGRATION_OWNER_PACKET

TASK_CLASSIFICATION: **SHARED_PLATFORM_WITH_EXTERNAL_DB**

Packet_role: **SEARCH_REPOSITORY_MIGRATION_READY** + **SEARCH_DB_MIGRATION_OWNER_PACKET_READY**  
Live SQL apply: **OWNER_ACTION / EXTERNAL_DB** (never from CI or agent merge)

Repo_commit: `dbaff6444` (packet tip; search RPC wiring `e75538921`)  
Base_main: `d2924d5fe` (2026-10-05)  
Related: `docs/audit/ARABIC_SEARCH_PRODUCTION_APPROVAL_PACKET.md` · Staging cert `docs/audit/ARABIC_SEARCH_V4_STAGING_CERTIFICATION_REPORT.md`

---

## 1. Inventory (docs + code)

| Layer | Status | Notes |
|---|---|---|
| SQL v2 (lessons/scholars/library FTS+trgm) | In repo, **not applied Production** | `migrations/20261003100000_arabic_search_infrastructure_v2.sql` |
| SQL v3 (hadith/source views + base RPCs) | In repo, **not applied Production** | `migrations/20261003110000_arabic_search_hadiths_sources_v3.sql` |
| SQL v4 (relevance + filters + keyset + SECURITY INVOKER) | In repo, **Staging PASS**, **Production false** | `migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql` |
| Client feature flag | **Default OFF** | `VITE_ARABIC_DB_RPC_SEARCH` / `localStorage ssunnah.arabic_db_rpc_search` · `arabic-search-feature-flag.ts` |
| RPC wrappers | **Present, gated** | `arabic-db-search.ts` — `searchHadithsDb`, `searchSourcesDb`, `searchArabicDbEntity`, `searchArabicDbContent` |
| Public platform search hot path | **ILIKE fallbacks** | `searchEverything` → `searchEverythingFallback` → per-table ILIKE + `arabicMatchAny` (`supabase.ts`) |
| Hadith section in platform search | **RPC when flag ON** | `searchHadithFallback` prefers `searchHadithsDb`; ILIKE emergency if RPC missing (42883/PGRST202) |
| Unified local index (`/data/search`) | **Primary UX path** | Thin hadith/scholar/fiqh/seerah — see `docs/audit/SEARCH_COVERAGE_REPORT.md` |
| Ranking authority | **Unchanged in this packet** | v4 SQL relevance weights untouched; client `arabic-search-relevance.ts` for local rank only |
| Observability | **Privacy-safe counters** | `search-observability.ts` records path/latency when RPC enabled |

### ILIKE / pattern sites (transitional — post-apply migration target)

| File | Pattern | Post-apply owner/client follow-up |
|---|---|---|
| `supabase.ts` | `searchLessonsFallback`, `searchSheikhsFallback`, `searchLibraryFallback`, `searchQaFallback`, `searchMiraclesFallback`, `searchFawaidFallback`, `searchStoriesFallback` | Wire `search_*` RPCs after v2 apply + flag |
| `dawah-service.ts` | `arabicSearchPatterns` / ILIKE | Same |
| `searchHadithFallback` | ILIKE **emergency only** when flag ON and RPC missing | Remove after Production RPC smoke PASS |

---

## 2. Migration files and apply order

Apply **in order** on Staging first, then Production after explicit owner checklist (`ARABIC_SEARCH_PRODUCTION_APPROVAL_PACKET.md`).

| Order | File (repo path) | SHA-256 |
|---:|---|---|
| 1 | `artifacts/majalis/supabase/migrations/20261003100000_arabic_search_infrastructure_v2.sql` | `6b44befbc181f12a0e66aae906060f777a50b1941e3ed4ef5e776c85da1a4247` |
| 2 | `artifacts/majalis/supabase/migrations/20261003110000_arabic_search_hadiths_sources_v3.sql` | `4d7d749ca342541dff2dd7871ef840ebc6359e25d6e5df6ccdabaa916e99ba19` |
| 3 | `artifacts/majalis/supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql` | `9d31e7caced441d198a7809ae71789b09871da1abf923aa3558c190c66b9c44b` |

Authoritative copies (same content as migrations):

- `artifacts/majalis/supabase/arabic_search_infrastructure_v2.sql`
- `artifacts/majalis/supabase/arabic_search_hadiths_sources_v3.sql`
- `artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4.sql`

**Post-apply column refresh (all environments):**

```sql
-- Touch source columns so generated/trigger-maintained search columns rebuild
UPDATE public.lessons SET title = title WHERE title IS NOT NULL;
UPDATE public.sheikhs SET name = name WHERE name IS NOT NULL;
UPDATE public.library_items SET title = title WHERE title IS NOT NULL;
UPDATE public.verified_hadith_items SET title = title WHERE title IS NOT NULL;
UPDATE public.trusted_sources SET name = name WHERE name IS NOT NULL;
```

---

## 3. Rollback

| Step | Action |
|---|---|
| 1 | Set `VITE_ARABIC_DB_RPC_SEARCH` unset / `localStorage` flag cleared (client default OFF) |
| 2 | Run `artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4_rollback.sql` on target DB |
| 3 | If invalid indexes after failed build: `DROP INDEX CONCURRENTLY` per runbook |
| 4 | Re-smoke `searchEverything` (ILIKE path remains in repo) |

v2/v3 rollback is **not** fully automated in one file — owner must restore from PITR if v2/v3 must be reversed wholesale.

---

## 4. Indexes (summary)

**v2:** GIN `search_vector`, GIN trgm on `ar_normalize(title|name)` for lessons, sheikhs, library_items.

**v3:** hadith/source trgm + FTS on `verified_hadith_items`, `trusted_sources`; views `public.hadiths`, `public.sources`.

**v4:** Composite filters `idx_hadith_rel_verified_auth_collection`, `idx_hadith_rel_verified_collection_chapter`; relevance RPCs; trigger-maintained `search_text` / `search_vector` on PG17.

**Production large tables:** use `docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md` (`CREATE INDEX CONCURRENTLY` outside transaction).

---

## 5. RPC signatures (v4 — Production target)

```sql
-- Hadith (ranked, filtered, keyset)
public.search_hadiths(
  q text DEFAULT NULL,
  lim int DEFAULT 20,
  p_collection text DEFAULT NULL,
  p_chapter text DEFAULT NULL,
  p_authenticity_class text DEFAULT NULL,
  p_source_name text DEFAULT NULL,
  p_narrator text DEFAULT NULL,
  p_cursor_score double precision DEFAULT NULL,
  p_cursor_id text DEFAULT NULL
) RETURNS TABLE (
  id text, title text, text_snippet text, narrator text, source_name text,
  collection text, chapter text, hadith_number text, grade text,
  authenticity_class text, matched_field text, relevance_score double precision,
  cursor_score double precision, cursor_id text
);

-- Sources
public.search_sources(
  q text DEFAULT NULL,
  lim int DEFAULT 20,
  p_category text DEFAULT NULL,
  p_source_type text DEFAULT NULL,
  p_cursor_score double precision DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL  -- verify live column type after apply
) RETURNS TABLE (...);

-- v2 entity RPCs (simpler q, lim)
search_lessons(q text, lim int)
search_sheikhs(q text, lim int)
search_scholars(q text, lim int)
search_library_items(q text, lim int)
search_hadith_items(q text, lim int)
```

Client parameter mapping: `artifacts/majalis/src/lib/arabic-db-search.ts` (`HadithRpcSearchRow`, `SourceRpcSearchRow`).

---

## 6. RLS impact

- RPCs are **`SECURITY INVOKER`** (v4) — results respect existing RLS on `verified_hadith_items` / `trusted_sources`.
- Staging certification: rejected/deleted/inactive rows hidden from **anon**; **service_role** admin paths intact (see staging cert report).
- Grants: `GRANT EXECUTE` on search functions to `anon`, `authenticated`, `service_role`; `GRANT SELECT` on views `hadiths` / `sources`.
- **No new RLS policies** in v4 SQL — owner must confirm Production policies match Staging before apply.

---

## 7. Staging validation (already executed)

- Staging ref: `dgxzcmzcapzcrvcfzjmc` (≠ Production `ngmvmlulzacrlicuagyp`)
- Evidence: GitHub Actions run `37134448010` · report `ARABIC_SEARCH_V4_STAGING_CERTIFICATION_REPORT.md`
- Functional: title/source/narrator/number/prefix/typo/hamza/tashkeel/ta-marbuta/filter/pagination — **PASS**
- EXPLAIN ANALYZE benchmark: no **REGRESSED** class — **PASS**

Production apply **must repeat** smoke + EXPLAIN on Production-sized data after backup.

---

## 8. Backup requirement (Production)

- [ ] Supabase **PITR** / logical backup confirmed ≤ 24h before apply
- [ ] Owner records ticket/chat approval (see checklist in `ARABIC_SEARCH_PRODUCTION_APPROVAL_PACKET.md`)
- [ ] Maintenance window for index builds on large tables

---

## 9. Before / after validation queries

**Before (Production, anon):**

```sql
SELECT proname FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND proname LIKE 'search_hadith%';

SELECT count(*) FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_hadiths_%';
```

**After apply:**

```sql
SELECT public.ar_normalize('القُرآن');  -- expect normalized form
SELECT id, title, relevance_score, matched_field
FROM public.search_hadiths('الفجر', 5);

SELECT id, name, relevance_score
FROM public.search_sources('مسند', 5);

SELECT indisvalid FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
WHERE c.relname LIKE 'idx_hadiths_%';
```

**Client smoke (Staging first, then Production with flag OFF until SQL PASS):**

```bash
# Staging-only — never set in Production until post-apply
VITE_ARABIC_DB_RPC_SEARCH=1 PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run dev
# Hit /search?q=الفجر — hadith section should use RPC when flag on
```

---

## 10. Latency plan

| Phase | Measurement | Gate |
|---|---|---|
| Pre-apply baseline | `EXPLAIN (ANALYZE, BUFFERS)` on ILIKE fallbacks + sample RPC on Staging | Capture in owner ticket |
| Post-apply Staging | Cert script `scripts/arabic-search-v4-staging-certification.mjs` | No REGRESSED |
| Post-apply Production | Same queries + anon REST RPC soak 15 min | p95 &lt; agreed SLO (owner) |
| Client rollout | Enable `VITE_ARABIC_DB_RPC_SEARCH` gradually | Monitor `search-observability` counters |

Latency benchmark without `DATABASE_URL`: documented as **NOT_CONNECTED** in `ARABIC_SEARCH_INFRASTRUCTURE_REPORT.md`.

---

## 11. Local unified index coverage plan (repo — no DB)

From `SEARCH_COVERAGE_REPORT.md` (thin kinds):

| Kind | Current | Min | Repo action |
|---|---:|---:|---|
| hadith | 6 | 20 | Expand `/data/search` shards — **FIXABLE_IN_REPOSITORY** (content pipeline) |
| scholar | 10 | 20 | Same |
| fiqh | 1 | 10 | Same |
| seerah | 1 | 5 | Same |

Does not block SQL apply; improves offline/unified search UX.

---

## 12. Repository fixes in this packet (FIXABLE)

| Item | Status |
|---|---|
| Typed RPC row types + missing-RPC detector | **FIXED** — `arabic-db-search.ts` |
| Gate `searchArabicDbEntity` / `searchArabicDbContent` behind feature flag | **FIXED** |
| Wire `searchHadithFallback` → `searchHadithsDb` when flag ON | **FIXED** — `supabase.ts` |
| ILIKE emergency path when RPC not deployed | **FIXED** |
| Owner packet (this document) | **FIXED** |

## 13. Owner / external actions (not done in repo)

| Item | Classification |
|---|---|
| Apply v2 → v3 → v4 SQL on Production Supabase | **OWNER_ACTION / EXTERNAL_DB** |
| Concurrent indexes on large Production tables | **OWNER_ACTION** |
| Enable `VITE_ARABIC_DB_RPC_SEARCH` in Production env | **OWNER_ACTION** (after smoke) |
| Migrate remaining ILIKE fallbacks (lessons/qa/fawaid/stories) to RPCs | **FIXABLE_IN_REPOSITORY** after apply |
| Latency before/after on Production | **OWNER_ACTION** (needs DATABASE_URL) |
| Expand thin local search index kinds | **FIXABLE_IN_REPOSITORY** (content) |

---

## 14. Explicit classification

```
SEARCH_REPOSITORY_MIGRATION_READY = true
SEARCH_DB_MIGRATION_OWNER_PACKET_READY = true
PRODUCTION_MIGRATION_APPLIED = false
PRODUCTION_SQL_APPLY = OWNER_ACTION / EXTERNAL_DB
```
