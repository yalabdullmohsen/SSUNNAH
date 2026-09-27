# WAVE — Hadith Data Truth & UX Hardening

**Wave:** HADITH_DATA_TRUTH  
**Date:** 2026-09-27  
**Product:** artifacts/majalis  
**Commit policy this session:** no commit / no push / no PR (per task brief)

## Scope Manifest

| Field | Value |
|---|---|
| Wave | A–F (implement A–E + plan F) |
| Objective | Honest counts, classification clarity, filter honesty, empty states, bounded visual polish, search/decomp plans |
| Confirmed problem | Conflicting Bukhari/Muslim counts; membership shown as independent grade; CDN advertised as local; silent empties; global search only sample-50 |
| Evidence | manifests 14940/1744; CDN 7563/3033; `searchHadithCorpus` = 50; index.json hadith docs = 6 |
| Files modified | HadithView, HadithBooksView, ArbaeenNawawiView, HadithCard, hadith-cdn-service, hadith.css, hadith-books.css, package.json scripts, corpus-stats gate |
| Files created | hadith-dataset-stats, collection-availability, authenticity-label, HadithDatasetSummary, HadithEmptyState, data-truth gate, remediation docs |
| Excluded | Hadith JSON content, Quran, SQL, full search index build, full HadithView rewrite |
| Content impact | None |
| Search impact | Plan only |
| Performance impact | Negligible (static labels/components) |
| Rollback | Revert wave files; manifests untouched |
| Focused tests | `pnpm --filter @workspace/majalis run test:hadith-data-truth` (+ related hadith gates) |
| Full verification | `verify:preflight` → `verify:ci` |

## Delivered

- Canonical dataset cards on `/hadith` (no combined total)
- Membership vs curated labels on cards/modal
- Filter availability classification + notes
- HadithEmptyState for list + books network failure
- Books page numbering/access honesty
- Docs: AUDIT, GLOBAL_SEARCH_PLAN, VIEW_DECOMPOSITION_PLAN, this wave file, ROOT progress

## Non-delivered (follow-ups)

- Build-time full Sahihayn search index
- Full HadithView decomposition
- Expanding curated content (out of scope — no new Hadith content)
