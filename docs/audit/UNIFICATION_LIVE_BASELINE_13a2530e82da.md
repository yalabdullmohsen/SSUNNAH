# UNIFICATION_LIVE_BASELINE_13a2530e82da

TASK_CLASSIFICATION: SHARED_PLATFORM

WEB_IMPACT: baseline lock only
IOS_APPLICATION_IMPACT: inventory counts only
APP_STORE_PRODUCT_IMPACT: none
SHARED_PLATFORM_IMPACT: measurement source of truth

## Live Main
- origin/main SHA: `13a2530e82dac5816760d5a04a933702088df744`
- tip: chore(harvest): تحديث feed المصادر (#2560)
- historical report SHA 2a6961a7f: SUPERSEDED

## Production
- ssunnah.com/version.json shortCommit: `999fb08e`
- PRODUCTION_MATCH vs live tip: PENDING_DEPLOY

## Open PRs
- none blocking

## Already merged (no re-execute without regression)
- #2557–#2567 design/governance
- #2568–#2572 widgets
- #2573 #2574 #2576 tokens
- #2560 harvest

## Live Metrics
- cssFiles: 353
- CSS bytes: 3857387
- design-system.css lines/bytes: 3216 / 90480
- important: 4724
- hexInCss (live walk): 5571
- rgbHsl (live walk): 1970
- buttonRelatedImportantApprox: **1138**
- buttonRelatedHexApprox: 971
- rawButtonFiles/Elements: 73 / 300
- divSpanOnClick: 37
- officialButtonImportFiles: 290
- bridgeCounts msk/elite/em/ds/majalis: 549 / 1 / 20 / 3356 / 3262
- empty uncommented: 0; KEEP_SPECIAL empty: 11
- widget Widget structs unique: 33
- compatibility dual surfaces: RETIRED (Tasbih/Tawhid/Search/Auth/UserStats)
- physical multi-file extract: KEEP_WITH_EVIDENCE

LIVE_BUTTON_IMPORTANT_BASELINE = 1138
LIVE_BUTTON_HEX_BASELINE = 971
LIVE_CSS_FILE_BASELINE = 353
LIVE_HEX_BASELINE = 5571
LIVE_IMPORTANT_BASELINE = 4724
LIVE_COMPATIBILITY_FILE_COUNT = 0_active_dual
LIVE_WIDGET_KIND_COUNT = 33

## PR1 target
buttonRelatedImportantApprox <= 1134

## Exit
LIVE_BASELINE_LOCKED = true
NO_BASELINE_CEILING_RAISE = true
