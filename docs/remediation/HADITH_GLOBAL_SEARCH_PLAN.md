# Hadith Global Search Plan — سُنّة

**Status:** PLAN ONLY (not implemented in data-truth wave)  
**Date:** 2026-09-27  
**Entry point today:** `/search` → `runAppSearch` → `unified-local` + scoped `searchHadithCorpus`

## Current coverage (measured)

| Surface | Indexed records | Evidence |
|---|---:|---|
| Platform `public/data/search/index.json` | **6** docs with kind/path hadith | hub + a few section stubs (not matn) |
| `lib/hadith-corpus/search.ts` | **50** sample rows | `content/hadith-corpus/sample-50.json` (~106 KB) |
| In-page `/hadith/sahih` search | all loaded Sahihayn (~14,940) after client load | `buildHadithSearchIndex` in HadithView |
| Arbaeen | 42 | `searchNawawi` local seed |

**Verdict:** Platform-wide search does **not** full-text cover the 14,940 local Sahihayn records. Claiming otherwise is false.

## Corpus fields available for indexing

From local Sahihayn lean JSON (`n`, `t`, optional `a`/`b`/`h`):

- `collection` (bukhari|muslim)
- `hadith_number` (`n`)
- `matn` / full text (`t`) — includes isnad+matn; can split via `splitHadithNarration`
- `book` / `inBook` / `arabicNumber` when present
- `chapter` label derived from book number

From curated verified seed: `narrator`, `grade`, `explanation`, `keywords`, `metadata.takhrij`, `authenticity_class`.

## Arabic normalization

Reuse existing:

- `normalizeArabic` / `shared/arabic-normalize` (diacritics strip, alef variants, digits)
- `toWesternDigits` for number queries
- `hadithNumberMatches` for رقم الحديث

Diacritics: strip at index time; query path must use the same normalizer.

## Collection + number search

Target query forms:

- `bukhari:1` / `muslim:15` → deep link `/hadith/bukhari:1`
- bare digits → ranked across books
- collection name tokens: البخاري، مسلم

## Estimated generated-index size (measured inputs)

| Input | Size |
|---|---:|
| `bukhari.json` + `muslim.json` raw | ~16.7 MB |
| Avg matn length Bukhari / Muslim | ~604 / ~545 chars |
| Rough lean index estimate (id + normMatn + number + collection) | **~5.2 MB** uncompressed JSON |
| gzip (expected) | ~1.5–2.2 MB (to be measured at build) |

Budget proposal:

- Initial payload to `/search`: ≤ 300 KB gzip chunk 0 (titles + numbers + short preview)
- Lazy chunks: matn shards of ≤ 400 KB gzip each
- Memory: keep ≤ 2 shards decoded at once (LRU)

## Chunking strategy

1. Build-time script reads local Sahihayn + curated + arbaeen.
2. Emit:
   - `hadith-search/meta.json` (counts, shard map, generatedAt, sha256)
   - `hadith-search/shard-000.json` … by collection then number ranges (e.g. 2k rows/shard)
3. Never mix CDN edition numbering into the local index without a `numberingSystem` field.

## Lazy-loading strategy

- On `/search` with scope=hadith or query matching حديث/بخاري/مسلم: load meta + shard heuristic.
- Number-only query: binary search shard map by number ranges.
- Text query: load shards progressively; cancel on query change (`RequestManager`).

## Cache strategy

- Cache-Control immutable by content hash in filename.
- In-memory LRU (existing `LruCache` pattern from CDN service).
- IndexedDB optional follow-up — not required for v1.

## Offline behavior

- Sahihayn local files already ship with the web asset tree → offline OK after first install/cache.
- Network catalog books remain online-only; search results must label `يتطلب اتصالًا` if pointing to `/hadith/books` CDN-only editions.

## Result ranking proposal

1. Exact id `book:number`
2. Exact hadith number in preferred collection (bukhari > muslim)
3. Title/narrator hit (curated)
4. Matn substring (normalized)
5. Chapter/book number match
6. Classification boost only when user filter requests daif/mawdu

## Deep-link destination

- Prefer `/hadith/{book}:{number}` (`HadithByIdPage`)
- Fallback `/hadith/sahih#cdn-{collection}-{n}` for list modal open
- Arbaeen → `/arbaeen-nawawi/{id}`

## Build-time generation path

Proposed (future PR):

```
artifacts/majalis/scripts/generate-hadith-search-index.mjs
→ public/data/hadith-search/*
wired from package build after sahihayn mirror sync
```

Do not block current web build until script + gate exist.

## Tests required (future)

- Gate: index count === 14940 + curated extras policy
- Normalization parity tests
- Number + id deep-link tests
- No cross-numbering collision (local vs CDN)
- Performance: cold search p95 budget on mid-tier mobile

## Performance budget (proposal)

| Metric | Budget |
|---|---|
| Meta fetch | < 100 ms cached |
| First hadith result (number query) | < 300 ms after meta |
| First matn shard decode | < 150 ms |
| Main-thread block per shard | < 50 ms (or worker) |

## Non-claims until shipped

Full-text global Hadith coverage is **not** claimed until index generation, wiring into `runAppSearch`, and gates are green.
