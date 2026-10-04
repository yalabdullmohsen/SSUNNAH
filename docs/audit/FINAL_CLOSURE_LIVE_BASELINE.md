# FINAL_CLOSURE_LIVE_BASELINE

TASK_CLASSIFICATION: SHARED_PLATFORM
WEB_IMPACT: yes
IOS_APPLICATION_IMPACT: Capacitor WebView CSS + Widget source present
APP_STORE_PRODUCT_IMPACT: none (Build 55; FUTURE_IOS_UPDATE_REQUIRED)
SHARED_PLATFORM_IMPACT: yes

Date: 2026-10-04
origin/main: `2a6961a7f`
Production version.json commit: `2a6961a7` MATCH

## Stale findings from program brief (reconciled)

| Brief claim | Live truth | Classification |
|---|---|---|
| cssFiles 356 | **355** after #2561 | UPDATED |
| `.fm-parent {}` remains | **REMOVED** in #2559 | STALE → already FIXED |
| Dead CSS not completed | fiqh-council-section.css removed | PARTIAL progress |
| PR #2558/#2557 merged | confirmed | ACCEPTED |

## Design metrics (live)

- CSS files: 355
- CSS bytes: 3865853
- design-system.css: 3277 lines / 90559 bytes
- DS selector blocks: 459
- Unique selectors: 422
- Repeated selectors: 33
- Empty rules in DS: 0
- Hex approx: 5615
- RGB/HSL approx: 2005
- !important approx: 4745
- border-radius px approx: 392
- box-shadow decls approx: 985
- z-index raw approx: 256

## Widget metrics (live)

- Catalog kinds: 32
- Widget structs: 33
- Bundle @main registrations: 32
- App Intents: 9
- Build: ['55']
- App Group: group.com.yousef.majlisilm
- FUTURE_BINARY: True

LIVE_BASELINE_CAPTURED = true
REPORT_AND_MAIN_RECONCILED = true
NO_UNKNOWN_BASELINE_ITEMS = true
