# SUNNAH FINAL RADICAL — LIVE BASELINE LOCK

LIVE_SHA: `ce7a4814eb39d3e3615b347b077d09c118caba75`  
MeasuredAt: `2026-10-05T06:38:48Z`  
Exit: **LIVE_BASELINE_LOCKED** · UNKNOWN_BASELINE_ITEMS = 0 · NO_CEILING_RAISE

TASK_CLASSIFICATION: SHARED_PLATFORM

## Platform separation

| Platform | Status |
|----------|--------|
| WEB_PLATFORM | Live tip MATCH production (this SHA) |
| IOS_APPLICATION | Repository ready; physical DEVICE_REQUIRED |
| APP_STORE_PRODUCT | FUTURE_BINARY / owner command required |
| SHARED_PLATFORM | Debt ceilings decreasing; gates held |

## DESIGN (measured)

| Metric | Value | Ceiling |
|--------|------:|--------:|
| cssFiles | 353 | 353 |
| important | 4720 | 4720 |
| hexInCss | 5557 | 5557 |
| rgbHslInCss | 1961 | 1961 |
| mjDeclarations | 193 | 193 |
| mjDeclOutsideAllowlist | 0 | 0 |
| boxShadowDecls | 982 | 982 |
| zIndexRawDecls | 255 | 255 |
| borderRadiusPxDecls | 391 | 391 |
| inlineColorStyleMatches | 38 | 38 |
| rawButtonFiles | 65 | 65 |
| mainSyncCssImports | 14 | — |
| mainDeferredCssImports | 55 | — |
| sfTokenRefs | 1220 | floor 1220 |
| ssTokenRefs | 772 | floor 772 |
| officialButtonImportFiles | 298 | floor 298 |

## INTERACTION (measured)

| Metric | Value | Ceiling |
|--------|------:|--------:|
| rawButtonFiles | 65 | 65 |
| rawButtonElements | 241 | 241 |
| divSpanOnClick | 37 | 37 |
| formButtonsMissingType | 0 | 0 |
| floatingControlFileMentions | 10 | 10 |
| buttonRelatedImportantApprox | 1134 | 1134 |
| buttonRelatedHexApprox | 971 | 971 |
| actionButtonConsumerFiles | 7 | floor 7 |
| iconButtonConsumerFiles | 44 | — |

## ROUTES

- open-route-debt classified (294): PARTIAL 8 · KEEP_JUSTIFIED 51 · DEVICE_REQUIRED 234 · OWNER_ACTION 1 · UNKNOWN 0
- Priority feedback routes closed in Wave4 / prior PRs
- Evidence: `docs/audit/OPEN_ROUTE_DEBT_CLASSIFICATION_d2924d5fe.md`

## MUSHAF

- Canonical: `/mushaf` → MushafReaderPage → NewMushafReader → MushafPager → MushafPage
- A4–A6 lock/subscription/offscreen repository improvements merged
- Interaction wave1: ControlsLayer text actions → Button (raw elements reduced)
- Quran integrity: unchanged
- Final silky/device claims: **DEVICE_REQUIRED**

## SEARCH

- Repository RPC readiness + DB owner packet merged (#2583)
- PRODUCTION_SQL_APPLIED = false → **EXTERNAL_DB**

## IOS / WIDGETS

- Widget repository readiness docs + gates present
- Physical matrix / Live Activity live data: **DEVICE_REQUIRED**
- Archive / TestFlight / App Store: **FUTURE_BINARY** / **OWNER_ACTION**

## Session tip merges (this program wave)

| PR | SHA | Effect |
|----|-----|--------|
| #2590 | a6a6f50f2 | Mushaf ControlsLayer Button authority |
| #2591 | 0871e65b7 | Admin CRUD → Button (65/241) |
| #2589 | 129c87b7e | T1 zero-consumer ds/majalis aliases (hex 5571→5569) |
| #2592 | ce7a4814e | T2 majalis zero aliases (hex 5569→5557, rgb 1970→1961) |

## Forbidden claims (until evidence)

UNIFIED_100 · FULLY_COMPLETE · ZERO_INTERNAL_DEBT · MUSHAF_SILKY · WCAG_CERTIFIED · DEVICE_TESTED · IOS_RELEASE_CANDIDATE_READY · STORE_GO

## Allowed verdict

**REPOSITORY_CLEAN_WITH_EXTERNAL_HOLDS** (interim: PROJECT_CLOSURE_PARTIAL / WEB_RELEASED_NATIVE_HOLD)
