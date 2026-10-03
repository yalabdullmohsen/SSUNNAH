# Evidence Requirements + Ingestion Contract

**Exit today:** `EVIDENCE_INGESTION_GATE_READY`  
**Scripts:** `scripts/device-evidence/validate-physical-evidence-pack.mjs`  
**Gate test:** `artifacts/majalis/src/lib/__tests__/ios-physical-evidence-ingestion-gate.test.ts`

## Pack layout

```text
docs/audit/device-evidence/<YYYYMMDD>-<appBuild>-<shortSha>/
  manifest.json
  rows/*.json
  artifacts/*          (png/jpg/webp/mp4 safe for git; no secrets)
```

## manifest.json required keys

```text
packId
capturedAt
physicalRequired = true
appVersion
appBuild
buildCommit
installSource          (TestFlight|AppStore|Xcode|Other)
originMainSha
productionVersionSha
deviceInventoryRef
testerIds[]            (non-PII handles only)
notes
```

## Row required keys (PASS/FAIL)

```text
caseId
suite                  (T040|T033|AUTH|WGT|LA|MSH|PRY|PUSH|A11Y|PERF)
deviceId
deviceModel
osVersion
appVersion
appBuild
installSource
tester
testedAt
result
artifactPath
expected
actual
physicalRequired
requiredBuildClass     (CAN_TEST_ON_BUILD_55|CAN_TEST_ON_CURRENT_REVIEW_BUILD|REQUIRES_FUTURE_BUILD_GE_56|NOT_APPLICABLE)
runtime                (physical|simulator)
failureNotes
reproSteps
logRef                 (optional string)
```

## Allowed results

```text
PASS
FAIL
BLOCKED_DEVICE
BLOCKED_BUILD
BLOCKED_PERMISSION
NOT_APPLICABLE
```

## Forbidden results

```text
UNKNOWN
PROBABLY_PASS
MANUAL_PASS_WITHOUT_ARTIFACT
DEVICE_REQUIRED          (use empty pack / omit row instead for unrun cases)
DEVICE_TESTED            (status claim, not a row result)
```

## Automatic rejects

- missing Device / OS / Build / Tester / Date / Result / Artifact on PASS/FAIL  
- Build mismatch vs manifest  
- `runtime=simulator` with `physicalRequired=true` and result PASS  
- `requiredBuildClass=REQUIRES_FUTURE_BUILD_GE_56` and `appBuild < 56` with PASS  
- PASS with empty artifactPath or missing file  
- certification claim strings inside notes: `DEEP_LINKS_CERTIFIED`, `IOS_AUTH_CERTIFIED`, `DEVICE_TESTED`, `WCAG_CERTIFIED`, `MUSHAF_SILKY`, `MOBILE_READY`  
- stale evidence: manifest.appBuild < 56 when suite is AUTH  

## Empty pack policy

Zero row files ⇒ gate exits OK with message `NO_PHYSICAL_ROWS` (program remains DEVICE_REQUIRED).  
Do **not** open an Evidence PR until ≥1 physical row with real artifact exists.

## PR rule

When real evidence exists: one Evidence PR updating matrices + pack.  
Keep FAIL rows honest; do not flip T-033/T-040 exits until required board complete.
