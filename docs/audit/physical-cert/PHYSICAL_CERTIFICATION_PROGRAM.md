# iOS Physical Certification Program — Preparation Authority

**Status:** `PHYSICAL_CERTIFICATION_PREP_READY` · execution = `DEVICE_CONNECTION_REQUIRED`  
**Generated (UTC):** `2026-10-03T16:22:12Z`  
**origin/main at prep:** `631dcc01e`  
**Production version.json:** `631dcc01` · MATCH  
**Policy:** No Archive · No TestFlight upload · No Store action · No empty evidence PR · No PASS without artifact  

## Non-claims (hard)

Forbidden until physical evidence packs pass ingestion gates:

`DEVICE_TESTED` · `DEEP_LINKS_CERTIFIED` · `IOS_AUTH_CERTIFIED` · `MOBILE_READY` ·
`MUSHAF_SILKY` · `WCAG_CERTIFIED` · `IOS_PUSH_CERTIFIED` · `STORE_GO`

Simulator evidence never satisfies physical certification.

## Index

| Doc | Role |
|-----|------|
| `BUILD_TO_TEST_CONTRACT.md` | Build eligibility matrix |
| `DEVICE_INVENTORY_CURRENT.md` | Connected / offline physical devices |
| `T040_DEVICE_MATRIX_RUNBOOK.md` | Surface matrix execution |
| `T033_DEEP_LINK_RUNBOOK.md` | Universal Link + scheme matrix |
| `AUTH_DEVICE_RUNBOOK.md` | Future Build ≥56 auth |
| `WIDGET_LIVE_ACTIVITY_RUNBOOK.md` | PrayerWidget + Live Activity |
| `MUSHAF_DEVICE_RUNBOOK.md` | Mushaf physical turns |
| `PRAYER_PUSH_RUNBOOK.md` | Local / remote / LA / widget |
| `ACCESSIBILITY_DEVICE_RUNBOOK.md` | VoiceOver / Dynamic Type / etc. |
| `PERFORMANCE_DEVICE_RUNBOOK.md` | Numeric measurement fields |
| `EVIDENCE_REQUIREMENTS.md` | Ingestion contract + verdicts |
| `FUTURE_BUILD_56_CHECKLIST.md` | Owner Archive checklist (do not execute here) |

## Live truth pins (this prep)

```text
CURRENT_APP_STORE_RELEASE     = 1.0 LIVE / READY_FOR_SALE
CURRENT_UPDATE_UNDER_REVIEW   = OWNER_DECLARED (do not touch ASC submission)
CURRENT_TESTFLIGHT_BUILD      = 1.0.1 (55) · ASC UUID a3fc6865-2fee-461e-8fa0-52601ea63163
NEXT_SOURCE_CANDIDATE         = origin/main tip (web MATCH) + MARKETING 1.0.1 · build pin still 55 in pbx
FUTURE_BUILD_REQUIREMENT      = CURRENT_PROJECT_VERSION ≥ 56 containing Keychain/hardening chain
OPEN_PR_BOARD                 = EMPTY
T-040                         = IOS_DEVICE_MATRIX_INCOMPLETE / DEVICE_REQUIRED
T-033                         = IOS_DEEP_LINKS_NOT_CERTIFIED / DEVICE_REQUIRED
Widgets authority             = PrayerWidget + PrayerLiveActivity on main (T-028/029/031)
Offline                       = OFFLINE_SCOPE_MANIFEST only (Expo #1791 obsolete)
```

## Evidence root

Physical packs must land under:

`docs/audit/device-evidence/<YYYYMMDD>-<build>-<shortSha>/`

with `manifest.json` + `rows/*.json` + `artifacts/*` (no tokens / emails / phone / Quran text dumps).

## Exit of this prep phase

```text
QUEUE_HANDOFF_COMPLETE
LIVE_TRUTH_RECONCILED
BUILD_TO_TEST_CONTRACT_READY
*_RUNBOOK_READY
EVIDENCE_INGESTION_GATE_READY
NO_EMPTY_EVIDENCE_PR_CREATED
NO_NEW_BUILD_CREATED
NO_STORE_ACTION_PERFORMED
DEVICE_CONNECTION_REQUIRED
```
