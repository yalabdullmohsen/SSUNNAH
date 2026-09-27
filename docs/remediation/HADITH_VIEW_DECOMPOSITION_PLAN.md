# HadithView Decomposition Plan — سُنّة

**Status:** PLAN ONLY (no full refactor in data-truth wave)  
**Date:** 2026-09-27  
**File today:** `artifacts/majalis/src/pages/hadith/ui/HadithView.tsx` (~1.1k+ lines)

## Why defer

- Mixes hub SEO, list loading, multi-source merge, filters, modal detail, and empty states.
- A big-bang split risks silent regressions in merge/curated overlay and deep links.
- Data-truth wave already extracts: dataset stats, availability, authenticity labels, empty state, dataset summary.

## Proposed boundaries

| Unit | Responsibility | Notes |
|---|---|---|
| `HadithHub` | `/hadith` cards + `HadithDatasetSummary` + SEO | default export today |
| `HadithListPage` | class routes sahih/daif/mawdu shell | wraps `HadithSection` |
| `HadithDetailSheet` | modal/sheet: matn/isnad/copy/share | today’s `HadithDetailModal` |
| `useHadithSources` | Sahihayn local → CDN fallback → curated merge | pure data hook + tests |
| `useHadithFilters` | collection/category/grade/number/book state | includes clear-all |
| `useHadithSearch` | `buildHadithSearchIndex` + pipeline | keep arabic normalize |
| `HadithEmptyState` | **done** this wave | keep as shared |
| `HadithDatasetSummary` | **done** this wave | keep as shared |

## Extraction order (future PRs)

1. Move `HadithDetailModal` → `HadithDetailSheet.tsx` (behavior-identical + modal tests).
2. Extract `useHadithSources` with fixture-based merge tests (no content edits).
3. Extract filter/search hooks; keep `HadithSection` as thin composer.
4. Split hub default export into `HadithHub.tsx`; re-export from page entry.
5. Delete dead helpers only after coverage green.

## Acceptance for each extraction PR

- Focused unit/gate tests green
- No matn/grade/attribution diffs in `git diff` for data files
- `test:hadith-data-truth` + `test:hadith-section-ui` + `test:hadith-corpus-stats` green
- Diff reviewable (< ~400 LOC preferred)

## Explicit non-goals now

- Full rewrite of HadithView
- New UI framework
- Changing scholarly merge rules beyond honesty labels already shipped
