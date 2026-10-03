# ARABIC_SEARCH_PRODUCTION_APPROVAL_PACKET

Date_UTC: 2026-10-03
PR_program: ARABIC_SEARCH_V4_STAGING_EXECUTION
Packet_status: READY_FOR_OWNER_APPROVAL
Evidence_run: https://github.com/yalabdullmohsen/SSUNNAH/actions/runs/37134448010
Evidence_report: docs/audit/ARABIC_SEARCH_V4_STAGING_CERTIFICATION_REPORT.md

## Status flags

PRODUCTION_MIGRATION_APPLIED = false
STAGING_EXISTS = true
STAGING_PROJECT_REF = dgxzcmzcapzcrvcfzjmc
PRODUCTION_PROJECT_REF = ngmvmlulzacrlicuagyp
STAGING_EQUALS_PRODUCTION = false
ENVIRONMENT_ISOLATION = PASS
STAGING_VALIDATION = PASS
STAGING_IDENTITY_CONFIRMED = true
PRODUCTION_APPROVAL_REQUIRED = true
CLIENT_RPC_FEATURE_FLAG_DEFAULT = disabled
DATABASE_PRODUCTION_CERTIFIED = false
PACKET_READY_FOR_PRODUCTION_APPLY = false (needs explicit owner checkbox approval)

## Staging certification results (PASS)

- PostgreSQL: 17.11
- Identity: pooler host aws-0-ap-southeast-2.pooler.supabase.com (IPv4) — Staging only
- Baseline: captured (tables verified_hadith_items / trusted_sources; synthetic seed rows for cert)
- Migration: PASS — pg_trgm, ar_normalize, to_tsvector_simple, search_text/search_vector (trigger-maintained), search_hadiths, search_sources, grants
- Indexes: PASS — 15 indexes, invalidCount=0
- RLS: PASS — rejected/deleted/inactive hidden from anon; service_role admin path intact
- Functional search: PASS — title/source/narrator/number/prefix/typo/hamza/tashkeel/ta-marbuta/filter/pagination
- EXPLAIN ANALYZE + benchmark: COMPLETE — no REGRESSED class (title/source/phrase IMPROVED; others UNCHANGED)
- Staging RPC soak: PASS (anon REST RPC; Production flag untouched)

## Migration files

- artifacts/majalis/supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql
- artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4.sql
- artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4_rollback.sql
- docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md
- Migration checksum (sha256): 9d31e7caced441d198a7809ae71789b09871da1abf923aa3558c190c66b9c44b

## Notes for Production apply

- Staging used trigger-maintained search_text/search_vector (PG17 rejects GENERATED + to_tsvector as non-immutable).
- Production apply must use the same tip SQL on main (post #2509/#2510).
- Prefer concurrent index runbook on large Production tables.
- Keep VITE_ARABIC_DB_RPC_SEARCH disabled until post-apply smoke PASS.
- Staging seed data is synthetic certification data — not a Production content clone.

## Rollback plan

- Follow arabic_search_hadith_source_infra_v4_rollback.sql
- Keep feature flag OFF during rollback
- Drop invalid indexes only via CONCURRENTLY if needed

## Rollout plan (after owner approval)

1. Explicit owner approval recorded below
2. Backup / PITR confirmed
3. Apply v4 SQL to Production (approved path only)
4. Concurrent indexes per runbook where required
5. Validate indisvalid + smoke search_hadiths/search_sources
6. Enable client RPC flag gradually
7. Monitor privacy-safe search.obs counters

## Explicit owner approval checklist

- [ ] I confirm Staging identity ≠ Production (dgxzcmzcapzcrvcfzjmc ≠ ngmvmlulzacrlicuagyp)
- [ ] I confirm Staging PASS evidence (run 37134448010) reviewed
- [ ] I approve Production SQL apply for Arabic search v4
- [ ] I accept concurrent index runbook and rollback ownership
- [ ] I will not enable client RPC flag until post-apply smoke PASS

## Classification

READY_FOR_OWNER_APPROVAL

PRODUCTION_DATABASE_MIGRATION_APPLIED = false
