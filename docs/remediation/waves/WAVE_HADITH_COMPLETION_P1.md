# WAVE — Hadith Completion Program Phase 1 (+4/5 docs)

**Wave:** HADITH_COMPLETION_P1_REGISTRY_AUDIT  
**Date:** 2026-09-27  
**Builds on:** WAVE_HADITH_DATA_TRUTH (not restarted)

## Scope Manifest

| Field | Value |
|---|---|
| Priority | P0 foundation |
| Objective | Canonical registry; integrity count alignment; completeness + license docs; wire stats from registry |
| Confirmed problem | Split truth sources; curated manifest off-by-four; advertised collections without honest completeness |
| Evidence | leanStats Sahihayn OK; verified chunks 1740≠1744; LICENSE_RISKS + IMPORT_QUEUE |
| Dataset affected | hadith-verified manifest counts (metadata); registry/stats selectors |
| Source affected | None new |
| Source version | fawazahmed0/hadith-api@1 (unchanged) |
| License status | Documented; no new import |
| Files modified | registry, dataset-stats, availability, authenticity-label, HadithView copy, data-truth gate, package.json, verified manifest counts |
| Files created | registry.ts, registry gate, docs/hadith/* |
| Files deleted | none |
| Excluded | matn/sanad, CDN import, full global search build, HadithView decomposition |
| Search impact | Docs only (plan remains) |
| Offline impact | Labels only |
| Performance impact | Negligible |
| Content impact | None (count metadata alignment only) |
| Rollback | Revert wave files; restore previous verified manifest if needed |
| Focused tests | test:hadith-collection-registry · test:hadith-data-truth |
| Full verification | verify:preflight → verify:ci |
| External blockers | Owner license decisions for sunan full local import |

## Delivered

- Canonical `HADITH_COLLECTION_REGISTRY`
- Manifest count alignment 1744→1740
- Completeness audit + source/license docs
- Phase 3 user copy refinements (sample vs corpus)
- Stats/availability derived from registry
