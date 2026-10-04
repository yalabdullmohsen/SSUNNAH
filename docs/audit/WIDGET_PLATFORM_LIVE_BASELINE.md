# WIDGET_PLATFORM_LIVE_BASELINE

TASK_CLASSIFICATION: IOS_ONLY_WITH_SHARED_DATA_FOUNDATION  
Date: 2026-10-04  
Source SHA: `8850b86e2eda9b36ceee1ae014d5e55dedd19098` (PR #2557 head)  
Merge-base with origin/main: `f4275d913`

WEB_IMPACT: `/widget-center` route + `widget-center.css` (must not impersonate WidgetKit on web)  
IOS_APPLICATION_IMPACT: Widget + Live Activity targets, App Group, envelope  
APP_STORE_PRODUCT_IMPACT: none this program (FUTURE_IOS_UPDATE_REQUIRED)  
SHARED_PLATFORM_IMPACT: `src/lib/widget-data/*`, JS gates, package.json scripts

## PR #2557 required checks (this SHA)

| Check | Result | Classification |
|---|---|---|
| classify-path-lane | PASS | — |
| static-checks | **FAIL** | JS_TYPECHECK |
| repo-gates | **FAIL** | GOVERNANCE (cssFiles) |
| build | PASS | — |
| visual-snapshot | PASS | — |
| Color contrast | PASS | — |
| LHCI home | PASS | — |
| iOS static gates + unit tests | PASS | — |
| xcodebuild-simulator | PASS | SWIFT_COMPILE (simulator, not device) |
| Verify build | FAIL | downstream of static-checks/repo-gates |
| ci-required | FAIL | downstream |
| mergeable | MERGEABLE / BLOCKED | — |

### Exact failures (CI logs, not guessed)

1. **JS_TYPECHECK** — `src/lib/widget-data/islamic-events.ts:89`  
   `TS2367`: comparison of narrowed `"approved"` with `"needs_review"` / `"draft"` has no overlap.
2. **GOVERNANCE** — `visual-system-debt-budget FAIL: cssFiles: 357 > ceiling 356`  
   New file: `artifacts/majalis/src/styles/pages/widget-center.css`  
   Must absorb or delete elsewhere. **Must not raise ceiling.**

## Native architecture (live from branch tree)

| Item | Count / value |
|---|---|
| Native targets (pbx productName) | App, PrayerWidgetExtension, PrayerLiveActivityExtension, CapApp-SPM |
| WidgetBundle `@main` | `PrayerWidgetBundle` (flat) |
| Live Activity `@main` | `PrayerLiveActivityBundle` |
| `struct … : Widget` | 34 (includes PrayerTimesWidget + catalog structs; Live Activity separate) |
| Catalog kinds in `catalog.ts` with `sunnah.widget.*` | 31 + legacy `PrayerTimesWidget` = **32** |
| App Intents (WidgetConfigurationIntent) | 9 |
| Timeline providers | `PrayerWidgetProvider`, `CatalogWidgetProvider` |
| App Group | `group.com.yousef.majlisilm` (contract docs; entitlements on Widget + Live Activity) |
| Envelope | `sunnah.shared.envelope.v1` (`SunnahWidgetEnvelope.swift`) |
| Preview fixtures | `SunnahWidgetPreviewFixtures.swift` |
| Widget Center | `WidgetCenterPage.tsx` / `WidgetCenterView.tsx` / `/widget-center` |

## Catalog kinds (32)

Prayer (9 including legacy PrayerTimesWidget): current, next, previous, hijri, previous-next, morning, evening, all, PrayerTimesWidget.  
Calendar (5): hijri, dual, today, ramadan, event.  
Adhkar (5): morning, evening, time-aware, rotating, streak.  
Quran/Mushaf (6): ayah, goal, continue, bookmark, progress, quick-open.  
Content (4): hadith, faidah, dua, custom.  
Home (3): today, actions, spiritual.

Baseline classification (not yet B2-complete per-kind fixture proof):

| Class | Notes |
|---|---|
| READY_WITH_CONFIGURATION | Custom + bookmark intents exist |
| READY_WITH_SETUP_STATE | Prayer kinds need published snapshot |
| KEEP_SPECIAL_WITH_EVIDENCE | Legacy `PrayerTimesWidget` still in bundle |
| DEVICE_REQUIRED | Live Widget Center / gallery on physical device |
| GOVERNANCE_BLOCKER | cssFiles + TS2367 must be FIXED on this PR |

PLACEHOLDER_ONLY / DUPLICATE_KIND / REMOVE_FROM_V1: not proven in this baseline; B2 must complete before claiming zero.

## Data domains present in tree

`widget-data/{catalog,center-state,islamic-events,prayer-window,preferences,privacy,progress-contract,repository,selections,types}.ts`  
Publication: `sunnah-widget-envelope-publish.ts`  
Gates: `ios-sunnah-widget-platform-contract-gate`, `ios-widget-data-platform-gate`, app-groups, prayer contract.

## Forbidden claims at baseline

WIDGET_GALLERY_PREVIEW_PASS ≠ LIVE_WIDGET_DATA_PASS  
xcodebuild-simulator PASS ≠ PHYSICAL_DEVICE_PASS  
IOS_SOURCE_COMPILES ≠ APP_STORE_READY


## Post-main-merge repository fixes (this PR)

| Item | Classification |
|---|---|
| `islamic-events.ts` TS2367 unreachable `needs_review`/`draft` after `review !== "approved"` | FIXED — check review states before approved narrowing |
| `cssFiles` 357 → 356 | FIXED — absorbed `widget-center.css` into account `settings.css`, deleted extra file, `border-radius: 999px` → `var(--sf-radius-pill)` |
| Main merge | `origin/main` `effa1c984` (#2558 squash) merged with both `package.json` hunks kept |
