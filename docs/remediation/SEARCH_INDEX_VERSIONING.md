# Search Index Versioning — سُنّة

## Schema version

| Constant | File |
|---|---|
| `SEARCH_INDEX_SCHEMA_VERSION` | `artifacts/majalis/src/features/search/search-index-version.ts` |

Current production-bound value: **3**

## When to bump

Increment when any of the following change:

- Search document shape / required fields
- Eligibility set (domains added/removed from public index)
- Navigation contract (how results must open)
- Cache incompatibility with older indexes

## Client behavior (`unified-local.ts`)

1. Memory cache accepted only if `version >= SEARCH_INDEX_SCHEMA_VERSION`
2. Worker / network / IndexedDB payloads with lower version are rejected
3. On reject: `purgeStaticJsonCache("/data/search/index.json")` — **search JSON only**
4. Does **not** clear bookmarks, reading progress, preferences, or auth

## Build

`generate-unified-search-index.mjs` writes `version: SEARCH_INDEX_SCHEMA_VERSION` into
`public/data/search/index.json`, then `validate:search-routes` must pass.
