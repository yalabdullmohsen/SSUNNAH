# Search Route Validation — سُنّة

## Gate

```bash
pnpm --filter @workspace/majalis run validate:search-routes
# أو ضمن generate:search-index بعد التوليد
```

Script: `artifacts/majalis/scripts/validate-search-route-integrity.mjs`

## Checks per search document

1. Non-empty title and href
2. No `/knowledge/history/` in public index
3. `/tarikh-islami/:id` resolves via `getHistoryItem`
4. `/prophets/:slug` and `/nations/:slug` resolve against registries
5. `resolveSearchHit` navigation href equals indexed href (no rewrite)
6. Index `version >= SEARCH_INDEX_SCHEMA_VERSION`

## Failure policy

Any failure increments `invalidPublicSearchDestinations` and is written to
`docs/remediation/SEARCH_INDEX_EXCLUSIONS.json`. The gate **fails** unless the count is **0**.

## Required invariant

`invalidPublicSearchDestinations = 0`
