# Search Route Integrity Audit — سُنّة

## Reproduced failure

| Field | Value |
|---|---|
| Query | `أبي بكر` / `خلافة أبي بكر` |
| Result ID | `history:rashidun-abu-bakr` |
| Result type | `history` |
| Source domain | Islamic history (`ISLAMIC_HISTORY_ITEMS`) |
| Indexed URL (valid) | `/tarikh-islami/rashidun-abu-bakr` |
| Navigated URL (broken) | `/tarikh-islami/history%3Arashidun-abu-bakr` |
| Route pattern | `/tarikh-islami/:id` |
| Content lookup | `getHistoryItem(id)` |
| Why detail fails | `id` becomes the composite search doc id (`history:…`) after URI encoding |
| Classification | `INVALID_ROUTE_PARAMETERS` at navigation time (index itself was clean) |

## Trace

```
Search query
→ SearchView / GlobalSearchModal
→ runKnowledgeSearch
→ runAppSearch (unified index — href صالح)
→ resolveSearchHit (kind=history → history_event)
→ hrefIslamicHistory(hit.id)  // hit.id = "history:rashidun-abu-bakr"
→ /tarikh-islami/history%3Arashidun-abu-bakr
→ TarikhIslamiDetailPage
→ getHistoryItem("history:rashidun-abu-bakr") → undefined
→ «هذا الموضوع غير متاح حاليًا»
```

## Root cause

`resolveSearchHit` rebuilt navigation URLs from **prefixed search document IDs** and **overwrote** the validated index `href` for mapped kinds (`history`, `surah`, `tafsir`, `prophet`, `adhkar`, `lesson`, `scholar`, …).

Affected navigation count before fix (local index): **1958** docs with rewritten paths, including **all 235** history results.

Secondary issue: dual public history catalogs — `ISLAMIC_HISTORY_ITEMS` → `/tarikh-islami/:id` and `knowledge/history` → `/knowledge/history/:id` both `kind=history`, causing duplicate cards and confusing identity for the resolver.

## What was NOT the cause

- Missing rows in `ISLAMIC_HISTORY_ITEMS` for indexed `/tarikh-islami/:id` (0 missing locally and on production index v2).
- Sitemap stale history URLs (217/217 resolve).
- Related-link href drift inside history JSON (0 broken related).

## Fix summary

1. Prefer validated index `href` for search navigation (`resolveSearchHit` + `runKnowledgeSearch`).
2. Exclude `knowledge/history` from the public search index (canonical = `/tarikh-islami`).
3. Bump search index schema to **v3**; reject/purge incompatible IndexedDB caches.
4. Compact unavailable state for external/old links (not indexed).
5. Build-time validator: `invalidPublicSearchDestinations = 0`.
