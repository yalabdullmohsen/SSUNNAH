# SUNNAH_RADICAL_COMPLETION_LIVE_BASELINE — 7846b787d

```
ACTIVE_PHASE: SUNNAH_RADICAL_PRODUCT_AND_REPOSITORY_COMPLETION_PROGRAM
TASK_CLASSIFICATION: SHARED_PLATFORM
WEB_IMPACT: baseline lock (docs) + subsequent tracks
IOS_APPLICATION_IMPACT: inventory only at Phase 0
APP_STORE_PRODUCT_IMPACT: none
SHARED_PLATFORM_IMPACT: live baseline authority

Captured_UTC: 2026-10-05T03:58Z
LIVE origin/main: 7846b787da6282e8e753179d8aac617a42f9a7ad
Historical report tip (SUPERSEDED): 9830f9b57 @ 2026-10-05T03:41Z
Delta vs historical: +#2579 FINAL_MILE live truth docs
Production version.json: 9830f9b5 (DRIFT vs tip — docs-only tip not yet deployed; LIVE_MAIN_WINS for repo work)
Open PRs: 0 · Open Issues: 0 · Worktrees: 1 (main)
iOS Build: MARKETING 1.0.1 · CURRENT_PROJECT_VERSION 55
NO_CEILING_RAISE: true
```

## Phase 0 exit

| Claim | Result |
|---|---|
| LIVE_BASELINE_LOCKED | **YES** |
| UNKNOWN_LIVE_DEBT | **0** |
| NO_CEILING_RAISE | **YES** |
| LIVE_MAIN_WINS over historical 9830f9b57 | **YES** |

## VISUAL (live vs ceilings)

| Metric | Live | Ceiling | Headroom |
|---|---:|---:|---:|
| cssFiles | 353 | 353 | **0** |
| important | 4720 | 4720 | **0** |
| hexInCss | 5571 | 5571 | **0** |
| rgbHslInCss | 1970 | 1970 | **0** |
| boxShadowDecls | 982 | 982 | **0** |
| zIndexRawDecls | 255 | 255 | **0** |
| borderRadiusPxDecls (budget scanner) | 391 | 391 | **0** |
| inlineColorStyleMatches | 39 | 39 | **0** |
| cssBytes | 3_857_509 | — | — |
| selectorBlocksApprox | 20517 | — | — |
| mainSyncCssImports | 14 | — | — |
| mainDeferredCssImports | 55 | — | — |
| bridge msk / ds / majalis | 549 / 3357 / 3266 | — | reduce via waves |
| canonical mj / sf / ss / cs | 11495 / 972 / 650 / 399 | — | — |

## INTERACTION (live vs ceilings)

| Metric | Live | Ceiling/Floor |
|---|---:|---:|
| rawButtonFiles | 73 | ≤73 |
| rawButtonElements | 300 | ≤300 |
| divSpanOnClick | 37 | ≤37 |
| formButtonsMissingType | 0 | ≤0 |
| buttonRelatedImportantApprox | 1134 | ≤1134 |
| buttonRelatedHexApprox | 971 | ≤971 |
| officialButtonImportFiles | 290 | ≥290 |
| actionButtonConsumerFiles | 7 | ≥7 |
| iconButtonConsumerFiles | 43 | — |
| floatingControlFileMentions | 10 | ≤10 |

## ROUTES

| Metric | Live |
|---|---:|
| route count | 415 |
| wave4TestedAt | 15 |
| routes with any PARTIAL field | 22 |
| open-route-debt | 294 (all UNKNOWN until Track classify) |

## MUSHAF ownership (A1 — decided from live wiring)

| Path / module | Role | Classification |
|---|---|---|
| `/mushaf` → `MushafReaderPage` → `NewMushafReader` (`features/mushaf-reader`) | Production reader | **CANONICAL_PRODUCTION** |
| `features/mushaf-shared/*` | Fonts, ayah sync, page-for-ayah, audio clock | **CANONICAL_PRODUCTION** (shared) |
| `features/mushaf-madinah/VerifiedMushafReader` | Not mounted on `/mushaf`; index says archival | **LEGACY_WITH_CONSUMERS** (helpers/sheets still imported) |
| Non-test imports of `@/features/mushaf-madinah` | 8 refs (bookmarks, QuranAudioPlayer dock, search/nav helpers) | **MIGRATE_THEN_REMOVE** helpers → shared; dock/sheets remain until migrated |
| `QuranViewer` via `/quran-engine` | Separate engine UI | **ACTIVE_SPECIAL** (not `/mushaf`) |
| Redirects `/quran/mushaf`, `/mushaf-v2-preview`, `/demo-ayah-reader` | → `/mushaf` | **NOT_APPLICABLE** (aliases) |

Evidence: `AppRoutes.tsx` Route `/mushaf` → `MushafReaderPage`; page imports `NewMushafReader` from `@/features/mushaf-reader` only.

### Already present (do not redo as greenfield)

| Track item | Status | Evidence |
|---|---|---|
| A2 telemetry | **FIXED** (repo) | `mushaf-turn-telemetry.ts` + `mushaf-experience-perf.ts` (DEV / localStorage flags; no Quran text/PII) |
| A3 neighbor font prefetch ±1/±2 idle | **FIXED** (repo) | `useQpcPageFont` + `NewMushafReader` idle ±2; capped queue |
| A4/A6 partial work | KEEP / continue | lock + content-visibility exist; refine only with gates |
| Device silky claim | **DEVICE_REQUIRED** | forbidden without device pack |

Exit A1: `MUSHAF_OWNERSHIP_DECIDED`

## WIDGET / iOS

| Item | Live | Class |
|---|---|---|
| Build | 55 | OWNER_ACTION to bump ≥56 |
| Catalog | 32 justified | FIXED repo |
| App Group | group.com.yousef.majlisilm | FIXED repo |
| FUTURE_BINARY_REQUIRED | true | FUTURE_BINARY |
| Physical evidence | packs present, device rows empty | DEVICE_REQUIRED |

## SEARCH

| Item | Class |
|---|---|
| Score 87 EXCELLENT | KEEP report |
| Live Supabase migration | **EXTERNAL_DB / OWNER_ACTION** |
| RPC wire + ILIKE transitional | FIXABLE in repo (client) + EXTERNAL_DB |
| Latency before/after | DEVICE_REQUIRED / DATABASE_URL |
| Client index hadith/scholar thin | FIXABLE |

## Backlogs

| Backlog | Count | Class |
|---|---:|---|
| POLISH_BACKLOG | 275 | FIXABLE waves |
| MICRO_FRICTION | 4 | FIXABLE |
| open-route-debt UNKNOWN | 294 | classify then FIXABLE/KEEP |
| Admin raw buttons | many ≤5/file | ADMIN_ONLY_WITH_EVIDENCE waves |

## Forbidden claims at baseline

```
CI_GREEN ≠ PRODUCT_COMPLETE
WEB_PASS ≠ IOS_PASS
BUILD_PASS ≠ RELEASE_READY
MUSHAF_REPOSITORY_TELEMETRY ≠ MUSHAF_SILKY
PRODUCTION_WEB_MATCH ≠ tip when docs-only lag
UNIFIED_100 = NOT_CLAIMED
```

## Execution order locked

1. A1 ownership (this file) → migrate madinah helper imports to shared  
2. A refine locks/subscriptions only with mushaf gates  
3. B deferred CSS graph + token leaf waves (margin first)  
4. C public buttons → polish → micro  
5. Routes classify 294 → public feedback  
6. Search client FIXABLE; DB = OWNER  
7. Widget device/build = DEVICE/OWNER  

END Phase 0 · tip=7846b787d · UNKNOWN_LIVE_DEBT=0 · NO_CEILING_RAISE
```
