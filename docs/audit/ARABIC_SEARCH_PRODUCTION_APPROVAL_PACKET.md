# ARABIC_SEARCH_PRODUCTION_APPROVAL_PACKET

Date_UTC: 2026-10-03
PR_program: SUNNAH_DATABASE_SEARCH_SECURITY_AND_PRODUCT_CLOSURE_PROGRAM
Authority: ARABIC_HADITH_SOURCE_SEARCH_INFRASTRUCTURE_REPORT + static review Phase 5–6
Packet_status: DRAFT_BLOCKED_CREDENTIAL_STAGING
Stabilization_phase: REPOSITORY_STABILIZATION_AND_RELEASE_CLOSURE

## Status flags

PRODUCTION_MIGRATION_APPLIED = false
STAGING_VALIDATION = BLOCKED_CREDENTIAL_STAGING
STAGING_IDENTITY_CONFIRMED = false
STAGING_EXISTS = false (discovery: STAGING_NOT_FOUND)
PRODUCTION_APPROVAL_REQUIRED = true
CLIENT_RPC_FEATURE_FLAG_DEFAULT = disabled
DATABASE_PRODUCTION_CERTIFIED = false (forbidden until live apply + metrics)
PACKET_READY_FOR_PRODUCTION_APPLY = false

## Migration files

- artifacts/majalis/supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql
- artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4.sql
- artifacts/majalis/supabase/arabic_search_hadith_source_infra_v4_rollback.sql
- docs/runbooks/ARABIC_SEARCH_HADITH_SOURCE_CONCURRENT_INDEXES.md
- Migration checksum (sha256): 495996733aae6579e3cc9e2e0bbf2a52143028ee7856b2aec0b9e9c446778f3a

## Static review (repository) — PASS

- ar_normalize IMMUTABLE STRICT PARALLEL SAFE + search_path=public
- ة→ه KEEP (client parity)
- search_vector / search_text generated expressions align with query predicates
- FTS uses to_tsvector/plainto_tsquery('simple')
- SECURITY INVOKER only (no DEFINER)
- RPC lim clamped (least/greatest → max 100)
- Empty / short query guarded
- Keyset: score DESC, id ASC
- Filters: verification_status=verified, deleted_at IS NULL, sources is_active
- Return shape: snippets + public fields (no admin JSON)
- Grants: EXECUTE to anon/authenticated/service_role on search RPCs; SELECT on views
- Rollback SQL present
- Client path feature-flagged OFF by default with legacy fallback error + unified local search retained

## Repository delivery (merged)

- PR #2497 MERGED → 458d97d62af29bae5305038c446fbdb7cee8ae72 (select-star, N+1, Arabic search contracts; RPC flag OFF)
- PR #2498 MERGED → 150b0d70f0ef08602a973b5256b1c18342741632 (index matrix, CRUD smoke, source relevance)
- PR #2499 MERGED → cea9595f831de53c536beeea83201a4fe90f1f86 (query-keys, invalidation, race/cache contracts)
- origin/main tip: cea9595f831de53c536beeea83201a4fe90f1f86
- Main CI (cea9595f): success — build, static-checks, repo-gates, Verify build, ci-required, postgres-integration
- Auto Deploy main → production: success
- Production version.json shortCommit: cea9595f → PRODUCTION_MATCH = true
- Production Supabase ref (documented): ngmvmlulzacrlicuagyp
- PRODUCTION_RPC_FLAG_DISABLED = true

## Staging sections (NOT EXECUTED)

- Staging Environment Identity: NOT_CONFIRMED / STAGING_NOT_FOUND
- GitHub Environment "Staging": absent
- STAGING_DATABASE_URL: absent (repo secrets + agent env)
- Pre-Migration Baseline: NOT_CAPTURED
- Migration Apply Result: NOT_RUN
- Index Validity (indisvalid): NOT_RUN
- Functional / RLS live: NOT_RUN
- EXPLAIN before/after: NOT_RUN
- Benchmark classes: INSUFFICIENT_DATA
- Client RPC Staging soak: NOT_RUN

## Owner credential setup (do not paste secrets into chat/PR)

1. Create a NEW Supabase project for Staging (name suggestion: sunnah-staging).
2. Confirm Staging project ref ≠ ngmvmlulzacrlicuagyp (Production).
3. Create GitHub Environment named exactly: Staging (required reviewer recommended).
4. Store Staging-only secrets (names):
   - STAGING_DATABASE_URL
   - STAGING_SUPABASE_URL
   - STAGING_ANON_KEY
   - STAGING_SERVICE_ROLE_KEY
   - STAGING_SUPABASE_ACCESS_TOKEN (optional, for CLI)
5. Store variables:
   - STAGING_SUPABASE_PROJECT_REF=<new-ref>
   - STAGING_ENVIRONMENT_MARKER=staging
   - PRODUCTION_SUPABASE_PROJECT_REF=ngmvmlulzacrlicuagyp
6. Document backup/restore for Staging.
7. Re-run identity verification (read-only) before any SQL.
8. Do NOT set Production DATABASE_URL into any STAGING_* secret.
9. Do NOT enable VITE_ARABIC_DB_RPC_SEARCH on Production.

## Production apply checklist (after Staging PASS only)

- [ ] Staging migration PASS
- [ ] All new indexes indisvalid = true
- [ ] EXPLAIN benchmark complete; no unaccepted regressions
- [ ] RLS + verified/active predicates confirmed live
- [ ] Rollback rehearsed on Staging
- [ ] Concurrent index runbook sequence accepted
- [ ] Feature flag remains disabled until post-apply soak
- [ ] Explicit owner approval recorded
- [ ] Apply via workflow_dispatch apply=true OR owner-operated SQL
- [ ] Concurrent indexes outside transaction per runbook
- [ ] Enable VITE_ARABIC_DB_RPC_SEARCH only after RPC smoke PASS
- [ ] Monitor search.obs counters (latency buckets, zero-result, fallback, errors) — no raw query text

## Expected execution sequence (Production)

1. Extension pg_trgm (if missing)
2. ar_normalize / normalize_ar
3. Generated search_text / search_vector
4. RPC functions + grants
5. B-tree relation indexes
6. FTS GIN
7. Trigram GIN (CONCURRENTLY per runbook, one at a time)
8. Validate indisvalid
9. Smoke search_hadiths / search_sources
10. Enable client flag gradually

## Lock / disk risks

- CONCURRENTLY avoids long ACCESS EXCLUSIVE but still needs disk for index builds
- Invalid index → stop, DROP INDEX CONCURRENTLY invalid, fix, retry — do not proceed to flag enable

## Rollback

- Follow arabic_search_hadith_source_infra_v4_rollback.sql
- Keep feature flag OFF during rollback
- Client continues unified/local search

## Client

- src/lib/arabic-db-search.ts — RPC when flag ON
- src/lib/arabic-search-feature-flag.ts — default OFF
- src/lib/search-observability.ts — privacy-safe counters
- Legacy/unified local search remains primary until flag ON

## Explicit owner approval checklist

- [ ] I confirm Staging identity ≠ Production
- [ ] I confirm Staging PASS evidence attached
- [ ] I approve Production SQL apply for Arabic search v4
- [ ] I accept concurrent index runbook and rollback ownership
- [ ] I will not enable client RPC flag until post-apply smoke PASS

## Stabilization closure note

- PR #2497 / #2498 / #2499 are terminal MERGED; no duplicate DB/search PR required for repository closure.
- Open non-DB PRs (#2460, #2456, #2299, #1791) are outside this database/search scope and were not closed.
- Packet remains DRAFT until Staging identity + live validation complete.
- PRODUCTION_DATABASE_MIGRATION_APPLIED = false
- PRODUCTION_RPC_FLAG_DISABLED = true
