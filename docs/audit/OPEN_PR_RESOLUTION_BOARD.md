# Open PR Resolution Board — iOS certification cleanup

**Phase:** `OPEN_PR_RESOLUTION_AND_IOS_CERTIFICATION_CLEANUP`  
**Date (UTC):** `2026-10-03`  
**Main tip at reconstruction:** `7ad9b9d0`  
**Production `version.json`:** `7ad9b9d0` · MATCH · `https://www.ssunnah.com/version.json`  
**Store (read-only, no Store action):** App Store `1.0` LIVE · TestFlight `1.0.1 (55)` available · Build 55 device certification **MISSING** (see `docs/store-release/BUILD_55_TRACEABILITY.md`)

## Classification results

| PR | Initial | Final | Action |
|----|---------|-------|--------|
| #2460 T-040 Device Matrix | OPEN · CONFLICTING · FAIL report | `DEVICE_REQUIRED` evidence absorbed · PR closed `COMPLETED_ELSEWHERE` | Unique evidence + honesty gate → main; certification remains FAIL / DEVICE_REQUIRED |
| #2456 T-033 Deep Links | OPEN · CONFLICTING · FAIL report | `DEVICE_REQUIRED` evidence absorbed · PR closed `COMPLETED_ELSEWHERE` | Report + sim evidence + gate + matrix script → main; NOT CERTIFIED |
| #2299 Widget Phase 1 | OPEN · danger-path · Android+old plugin | `SUPERSEDED` closed | Successor T-028/029/031 on main; archive doc only |
| #1791 Offline-First MMKV | OPEN Draft · Expo | `OBSOLETE` closed | Manifest extracted; no merge |

## Honest certification (do not flip)

```text
IOS_DEVICE_MATRIX_INCOMPLETE          (T-040)
IOS_DEEP_LINKS_NOT_CERTIFIED          (T-033)
IOS_WIDGETS_PRAYER_CERTIFIED          (T-029 on main — static/build)
PHYSICAL_DEVICE_MATRIX                DEVICE_REQUIRED
PHYSICAL_UNIVERSAL_LINKS              DEVICE_REQUIRED
DEEP_LINKS_CERTIFIED                  false (Simulator evidence ≠ certification)
DEVICE_TESTED                         false
```

## Successor merges (widgets)

| PR | Merge | Topic |
|----|-------|-------|
| #2452 | `86fbcfd5` | T-028 App Groups foundation |
| #2453 | `6995b823` | T-029 PrayerWidget six families |
| #2454 | `4d26acf5` | T-031 Prayer Live Activity |

## Preserved unique paths (this sync)

- `docs/audit/evidence/t040-ios-device-matrix/**`
- `docs/audit/evidence/t033-ios-deep-links/**`
- `docs/audit/IOS_DEEP_LINKS_CERTIFICATION_REPORT.md` (was missing on main)
- Honesty gates under `artifacts/majalis/src/lib/__tests__/ios-*-certification-gate.test.ts`
- `scripts/ios-deep-links-certification-matrix.sh`
- `docs/mobile/OFFLINE_SCOPE_MANIFEST.md`
- `docs/native-widgets/archive/SUNNAH_WIDGET_SYSTEM_PR2299_PHASE1.md` (historical only)
- `docs/audit/DEVICE_REQUIRED_CHECKLIST_CURRENT.md`

## Exit

```text
PR_2460_CLASSIFIED
PR_2456_CLASSIFIED
PR_2299_CLASSIFIED
PR_1791_CLASSIFIED
ALL_UNIQUE_WORK_PRESERVED
SUPERSEDED_PRS_CLOSED
OBSOLETE_PRS_CLOSED
DEVICE_REQUIRED_PRS_DOCUMENTED
NO_UNEXPLAINED_OPEN_PR
```
