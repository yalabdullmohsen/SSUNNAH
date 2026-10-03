# ARABIC_SEARCH_PRODUCTION_APPROVAL_PACKET

Date_UTC: 2026-10-03
PR_program: ARABIC_SEARCH_V4_STAGING_CERTIFICATION_AND_PRODUCTION_PACKET
Packet_status: BLOCKED_WITH_EVIDENCE
Stabilization_phase: STAGING_CERTIFICATION_CONNECTIVITY_BLOCKER

## Status flags

PRODUCTION_MIGRATION_APPLIED = false
STAGING_EXISTS = true
STAGING_PROJECT_REF = dgxzcmzcapzcrvcfzjmc
PRODUCTION_PROJECT_REF = ngmvmlulzacrlicuagyp
STAGING_EQUALS_PRODUCTION = false
ENVIRONMENT_ISOLATION = PASS
STAGING_VALIDATION = BLOCKED_WITH_EVIDENCE
STAGING_IDENTITY_CONFIRMED = true
PRODUCTION_APPROVAL_REQUIRED = true
CLIENT_RPC_FEATURE_FLAG_DEFAULT = disabled
DATABASE_PRODUCTION_CERTIFIED = false
PACKET_READY_FOR_PRODUCTION_APPLY = false

## Blocker (authoritative)

GitHub Actions cannot open a TCP session to the current `STAGING_DATABASE_URL` host:

- Error class: `STAGING_DB_NO_IPV4_A_RECORD` / prior `ENETUNREACH` on IPv6 `:5432`
- Evidence run: https://github.com/yalabdullmohsen/majalis/actions/runs/37130808222
- Report: `docs/audit/ARABIC_SEARCH_V4_STAGING_CERTIFICATION_REPORT.md`

Identity preflight PASS (Staging ref ≠ Production; required secrets present).
SQL apply / indexes / RLS / functional / EXPLAIN / soak were NOT executed because the DB TCP path is unreachable from CI.

### Owner fix (Staging only — do not touch Production)

1. Open Supabase project `dgxzcmzcapzcrvcfzjmc` → Project Settings → Database.
2. Copy the **Connection pooling** URI (Session mode preferred for migrations; Transaction mode `:6543` also acceptable if IPv4).
3. Replace GitHub Environment `staging` secret `STAGING_DATABASE_URL` with that Pooler URI (must still reference Staging ref only).
4. Re-run workflow: **Arabic Search v4 Staging Certification**.
5. Do not change Production secrets/URLs/flags.

## Migration files

- artifacts/majalis/supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql
- artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4.sql
- artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4_rollback.sql
- docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md
- Migration checksum (sha256): 495996733aae6579e3cc9e2e0bbf2a52143028ee7856b2aec0b9e9c446778f3a
- Staging cert harness: artifacts/majalis/scripts/arabic-search-v4-staging-certification.mjs
- Workflow: .github/workflows/arabic-search-v4-staging-certification.yml

## Staging sections

- Staging Environment Identity: CONFIRMED (dgxzcmzcapzcrvcfzjmc ≠ ngmvmlulzacrlicuagyp)
- Secret availability: PASS (four required secrets on Environment `staging`)
- Pre-Migration Baseline: NOT_CAPTURED (DB TCP blocked)
- Migration Apply Result: NOT_RUN
- Index Validity (indisvalid): NOT_RUN
- Functional / RLS live: NOT_RUN
- EXPLAIN before/after: NOT_RUN
- Client RPC Staging soak: NOT_RUN
- Benchmark classes: INSUFFICIENT_DATA

## Repository delivery (merged; Production MATCH expected via deploy)

- Arabic Search v4 SQL + client flag OFF + static gates on main
- Staging certification workflow + harness on main
- Production RPC flag remains disabled
- PRODUCTION_DATABASE_MIGRATION_APPLIED = false

## Rollback plan (unchanged; Staging-first)

- Use `arabic_search_hadith_source_infra_v4_rollback.sql` on Staging only after a successful apply
- Keep Production feature flag OFF during any rollback
- Invalid indexes: `DROP INDEX CONCURRENTLY` only for invalid indexes

## Rollout plan (after connectivity + Staging PASS)

1. Complete Staging certification → READY_FOR_OWNER_APPROVAL
2. Owner explicit approval
3. Production apply via approved path only
4. Concurrent indexes per runbook
5. Enable `VITE_ARABIC_DB_RPC_SEARCH` only after Production smoke
6. Monitor privacy-safe search.obs counters

## Explicit owner approval checklist

- [ ] I updated Staging `STAGING_DATABASE_URL` to an IPv4 Pooler URI for `dgxzcmzcapzcrvcfzjmc`
- [ ] Staging certification workflow PASS
- [ ] I confirm Staging identity ≠ Production
- [ ] I confirm Staging PASS evidence attached
- [ ] I approve Production SQL apply for Arabic search v4 (later task)
- [ ] I will not enable client RPC flag until post-apply smoke PASS

## Classification

BLOCKED_WITH_EVIDENCE

PRODUCTION_DATABASE_MIGRATION_APPLIED = false
