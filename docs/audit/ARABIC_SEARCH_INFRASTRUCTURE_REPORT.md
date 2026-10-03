# ARABIC_SEARCH_INFRASTRUCTURE_REPORT

Generated: 2026-10-03

Phase: **ARABIC_SEARCH_INFRASTRUCTURE_HARDENING**

Live DB: **NOT_CONNECTED**

Latency benchmark: **NOT_CONNECTED — no before/after wall-clock without DATABASE_URL**

## Artifacts

| Artifact | Present |
|---|---|
| ar_normalize SQL (v2) | ✅ |
| migrations/…v2.sql | ✅ |
| legacy normalize_ar | ✅ |
| pg_trgm | ✅ |

## Entity inventory

| Entity | Table | trgm | FTS | RPC |
|---|---|---|---|---|
| lessons | `lessons` | ✅ | ✅ | ✅ |
| scholars | `sheikhs` | ✅ | ✅ | ✅ |
| books | `library_items` | ✅ | ✅ | ✅ |
| hadith | `verified_hadith_items` | ✅ | ✅ | ✅ |
| sources | `trusted_sources|scholarly_sources` | ✅ | ❌ | ❌ |

## Indexes declared (v2)

- `lessons_search_vector`: ✅
- `lessons_title_ar_trgm`: ✅
- `scholars_name_trgm`: ✅
- `books_search_vector`: ✅
- `books_title_trgm`: ✅
- `hadith_search_vector`: ✅
- `hadith_title_trgm`: ✅
- `sources_name_trgm`: ✅

## RPCs declared

- `search_lessons`: ✅
- `search_sheikhs`: ✅
- `search_scholars`: ✅
- `search_library_items`: ✅
- `search_hadith_items`: ✅
- `search_content_hybrid`: ✅

## Client debt

| Metric | Value |
|---|---:|
| ilike sites ≈ | 7 |
| arabicSearchPatterns sites | 5 |
| hybrid RPC search sites | 1 |

Migrate supabase.ts / dawah-service ILIKE paths to search_* RPCs after migration apply

## Estimated improvements

- Normalized FTS avoids multi-pattern ILIKE OR explosions
- GIN(trgm) on ar_normalize(title) enables % / similarity without seq scan on large tables
- search_vector GIN speeds plainto_tsquery on lessons/sheikhs/library/hadith
- Client still uses local unified index for public search — DB layer for authenticated/API paths

## Remaining debt

- Apply migration on live Supabase + rebuild generated columns (UPDATE title=title)
- Wire client RPC callers; ILIKE pattern helpers remain for transitional paths
- qa/fawaid/stories still partially ILIKE in search_content
- Latency before/after: DEVICE_REQUIRED / DATABASE_URL
- Client unified index hadith/scholar coverage still thin (separate from SQL)

SQL: `supabase/arabic_search_infrastructure_v2.sql`
