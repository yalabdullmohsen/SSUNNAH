# SELECT_STAR_ELIMINATION_REPORT

Authority: DATABASE_EXCELLENCE_REPORT / VISUAL_BK_BO_DATABASE_EXCELLENCE_REPORT  
Phase: SELECT_STAR_ELIMINATION_AND_QUERY_HARDENING  
Date_UTC: 2026-10-03  
Mode: CLIENT_QUERY_SHAPE_ONLY — no RLS / permissions / schema / business-logic changes  
PRODUCTION_DATABASE_MIGRATION_APPLIED: false

## Before / After

| Metric | Before | After |
|---|---:|---:|
| Data-fetch exact `select('*')` (engine) | 48 | **0** |
| Nested `select('*, …')` literals | present (lessons/library/qa) | **0** |
| Count probes `select('*', { count, head })` | 5 | **0** (now `select('id', …)`) |
| `adminFetchAll(table, "*")` string stars | sheikhs / miracles / fawaid / profiles / quiz | **0** (explicit cols) |
| Static DB health scorecard | 66 / NEEDS_WORK | **76 / GOOD** |
| Costs proxy | 44 / CRITICAL | **84 / GOOD** |
| Performance proxy | 46 / CRITICAL | **70 / GOOD** |

## Validation

- typecheck = PASS
- build = PASS
- postgres-integration = SKIPPED (no MIGRATION_TEST_DATABASE_URL) / exit 0
- verify:preflight = PASS
- verify:ci = PASS
- test:database-excellence = PASS (`select*=0`)

## Method

1. Inventory every `.select("*")` / `.select('*')` under `artifacts/majalis/src`.
2. Map consumed columns from TS entity types and admin UI EMPTY/form field use.
3. Centralize projections in `artifacts/majalis/src/lib/db-select-columns.ts`.
4. Replace call sites; preserve nested PostgREST embeds by composing `cols, relation(...)`.
5. Harden remaining string-arg stars in `adminFetchAll(...)` and count-only probes.
6. Gate: `database-excellence-gate` requires `selectStar === 0`.

## Files modified

### Core projection module
- `artifacts/majalis/src/lib/db-select-columns.ts` (new)

### P0 Admin
- `lib/auto-content-service.ts`
- `lib/cms/audit-log.ts`
- `lib/cms/supabase-cms.ts` (+ count probes → `id`)
- `lib/categories-admin-service.ts`
- `lib/learning-paths-admin-service.ts`
- `lib/platform-supabase.ts`
- `lib/supabase.ts` (lessons/sheikhs/library/miracles/fawaid/profiles/qa/quiz admin lists)
- `lib/adhkar-supabase.ts` (count probe → `id`)
- `views/admin/ProphetStoriesSection.tsx`
- `views/admin/IslamicStoriesSection.tsx`
- `lib/dawah-service.ts` (admin queues + nested public category joins)

### P1 Library
- `lib/platform-content-service.ts`
- `lib/unified-content-service.ts` (public cols omit heavy admin JSON)
- `lib/quran-circles-service.ts`
- `lib/book-reading-plan-service.ts`

### P2 Account
- `lib/user-submissions-service.ts`
- `lib/user-progress-service.ts`
- `lib/vault-service.ts`
- `lib/researcher-profile-service.ts`
- `lib/study-session-service.ts`
- `views/MySubmissionsPage.tsx`
- `views/FamilyModePage.tsx`

### Gates / scorecards
- `lib/__tests__/database-excellence-gate.test.ts`
- Regenerated `docs/audit/SUNNAH_DATABASE_HEALTH_SCORECARD.md`, `QUERY_OPTIMIZATION_QUEUE.md`, heatmap/index/cache reports via engine

## Queries improved (representative)

| Area | Table | Consumed | Dropped (examples) | Projection |
|---|---|---|---|---|
| Admin | auto_imported_content | typed AutoImportedContent / admin UI | unknown DB extras | AUTO_IMPORTED_CONTENT_COLS |
| Library public | auto_imported_content | card/list fields | ai_analysis, structured_data, error_details | AUTO_IMPORTED_CONTENT_PUBLIC_COLS |
| Admin | dawah queues | id/title/status/snippet | full body/refutation | DAWAH_QUEUE_COLS |
| Admin | lessons | LESSON_DETAIL_COLUMNS + sheikhs(name) | unbounded `*` | explicit + embed |
| Admin | sheikhs / library / miracles / fawaid / profiles / quiz / qa | form EMPTY fields | unbounded `*` via adminFetchAll | explicit lists |
| Count probes | various | none (head:true) | N/A | `select("id", { count, head })` |

## Estimated payload reduction

Static proxies only (DATABASE_URL NOT_CONNECTED — not live EXPLAIN):

- Exact `select('*')` data fetches eliminated (48 → 0).
- Public auto-content lists drop heavy admin JSON blobs (largest expected Library bandwidth win).
- Admin dawah queues no longer pull full article/shubha bodies for list cards.
- `adminFetchAll("*")` admin lists now project UI-consumed columns only.
- Scorecard cost proxy **44 → 84**; overall **66 → 76**.

Do **not** treat these as measured production byte savings without Staging/Production metrics.

## Remaining select('*')

**None** for:

- exact `.select("*")` / `.select('*')`
- nested `.select("*, …")` literals
- count probes using `"*"`

Optional future follow-ups (not blockers):

- N+1 suspects remain in `QUERY_OPTIMIZATION_QUEUE.md` (P1=12, unrelated to select-star).
- Live payload certification still requires Staging/Production DATABASE_URL.

## Blockers

1. Live bandwidth / serialization timing: UNPROVEN without connected DB metrics.
2. If a DB column used by an admin form was omitted from a projection, runtime PostgREST would return null for that field — projections were derived from EMPTY/form field inventories to avoid that; verify admin CRUD smoke on Staging if available.

## Exit flags

SELECT_STAR_DATA_FETCH_COUNT = 0  
NESTED_STAR_LITERAL_COUNT = 0  
COUNT_PROBE_STAR_COUNT = 0  
STATIC_COST_PROXY_IMPROVED = true  
NO_SCHEMA_CHANGE = true  
NO_PRODUCTION_MIGRATION = true  
VERIFY_CI = PASS
