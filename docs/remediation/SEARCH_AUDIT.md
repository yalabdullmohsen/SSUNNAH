# Search Audit — سُنّة (living)

## Active public search path

| Step | Location |
|---|---|
| UI | `/search` → `SearchView`, `GlobalSearchModal`, `HomeUniversalSearch` |
| Engine | `runAppSearch` / `runKnowledgeSearch` |
| Index | `public/data/search/index.json` via `generate-unified-search-index.mjs` |
| Client load | `features/search/unified-local.ts` |

## Integrity contract (2026-09)

- Navigation uses **indexed href** (never rebuilt from composite doc ids).
- Public history = `/tarikh-islami` registry only (no `/knowledge/history` in index).
- Schema version: see `SEARCH_INDEX_VERSIONING.md`.
- Gate: `validate:search-routes` → `invalidPublicSearchDestinations = 0`.
- COMING_SOON / product EXCLUDED hubs blocked via `public-search-blocklist.ts` (e.g. `/islamic-sects`) — see `waves/WAVE_SEARCH_BLOCKED_EXCLUDE_W1.md`.

## Related docs

- `SEARCH_ROUTE_INTEGRITY_AUDIT.md`
- `SEARCH_ROUTE_VALIDATION.md`
- `SEARCH_INDEX_EXCLUSIONS.json`
- `waves/WAVE_SEARCH_INTEGRITY.md`
- `waves/WAVE_SEARCH_BLOCKED_EXCLUDE_W1.md`
