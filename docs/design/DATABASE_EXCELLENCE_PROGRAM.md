# DATABASE_EXCELLENCE_PROGRAM — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `DATABASE_EXCELLENCE_ENGINE` |
| Script | `artifacts/majalis/scripts/database-excellence-engine.mjs` |
| Gate | `test:database-excellence` |

Static schema + client query audit. **Live `pg_stat_*` requires `DATABASE_URL` / `SUPABASE_DB_URL`** — otherwise metrics are marked `NOT_CONNECTED`.

## Phases BK–BO

| Phase | Output |
|---|---|
| DATABASE_PERFORMANCE_DEEP_AUDIT | `DATABASE_HEATMAP_REPORT` |
| SUPABASE_QUERY_OPTIMIZATION | `QUERY_OPTIMIZATION_QUEUE` |
| DATABASE_INDEX_STRATEGY_REVIEW | `INDEX_AUTHORITY_REPORT` |
| DATA_CACHING_STRATEGY_REVIEW | `CACHE_OPTIMIZATION_PLAN` |
| DATABASE_READINESS_CERTIFICATION | `SUNNAH_DATABASE_HEALTH_SCORECARD` |

## Related gates (unchanged)

- `test:supabase-policy-audit` — open `FOR ALL USING (true)` without `service_role`
- `test:critical-path-select` · `test:lessons-inflight-dedup`

## Non-claims

لا اختراع أرقام latency بدون اتصال · لا UNIFIED_100 · لا خفض سياسات RLS.
