# T-040 Device Matrix Runbook

**Exit today:** `T040_DEVICE_MATRIX_RUNBOOK_READY` · execution `DEVICE_REQUIRED`  
**Honesty:** historical `IOS_DEVICE_MATRIX_INCOMPLETE` remains until packs pass gates  
**Eligible builds for smoke:** `TF_55` / review build · tip-aligned cert prefers `≥56`

## Mandatory fields per row (PASS/FAIL impossible without all)

```text
deviceModel · osVersion · appVersion · appBuild · installSource
tester · testedAt · result · artifactPath · failureNotes
reproSteps · logRef(optional) · buildCommit · physicalRequired=true
```

Allowed `result`: PASS | FAIL | BLOCKED_DEVICE | BLOCKED_BUILD | BLOCKED_PERMISSION | NOT_APPLICABLE  
Forbidden: UNKNOWN | PROBABLY_PASS | MANUAL_PASS_WITHOUT_ARTIFACT | DEVICE_TESTED as a result

## Device classes

1. iPhone primary (modern) — candidate: iPhone 17 Pro when connected  
2. iPhone secondary (older/smaller) — candidate: iPhone 13 when connected  
3. iPad  
4. iPad Split View  

## Surfaces (each device)

Home · Search · Quran Hub · Mushaf · Prayer · Lessons · Account · Settings

## Scenarios per surface (minimum)

```text
clean launch (cold)
warm launch
background → foreground
portrait
landscape (where supported)
light theme
dark theme
RTL
offline / interrupted connection (where applicable)
iPad regular width (iPad only)
iPad Split View (iPad Split only)
```

## Case ID pattern

`T040-<DEVICE>-<SURFACE>-<SCENARIO>`

Examples:

```text
T040-IP-PRIMARY-HOME-COLD
T040-IP-PRIMARY-MUSHAF-BG-FG
T040-IP-SECONDARY-SEARCH-DARK
T040-IPAD-PRAYER-SPLIT
T040-IPAD-SETTINGS-LANDSCAPE
```

## Execution steps (operator)

1. Connect device; confirm model/OS; note Install Source (`TestFlight` / `AppStore` / `Xcode`).  
2. Record App Version + Build from Settings → Sunnah (or ASC).  
3. Capture `node scripts/device-evidence/capture-build-context.mjs`.  
4. For each case: perform steps → screenshot/video → write row JSON from template.  
5. Run ingestion gate (must fail closed if PASS missing fields).  
6. Do not flip T-040 report to COMPLETE until required board cells PASS with artifacts.

## Install source rules

```text
App Store 1.0 / review binary  → smoke only; declare exact version/build
TestFlight 55                   → smoke / baseline only
Future ≥56                      → tip-aligned certification rows
```

## Related evidence

Historical FAIL pack (not physical PASS): `docs/audit/evidence/t040-ios-device-matrix/`  
Checklist: `docs/audit/DEVICE_REQUIRED_CHECKLIST_CURRENT.md`
