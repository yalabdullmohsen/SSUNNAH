# MRMP v1 Tracker

| Updated | 2026-10-01 |
| Program tip (charter) | branch `cursor/mrmp-v1-program-charter` |
| Web tip at charter | `origin/main` = `2c8aa1ae` · production MATCH |
| Program verdict | **MOBILE_PARTIALLY_READY** (shell exists · store/device evidence incomplete) |

## Phase board

| Phase | Exit | Status | Blocker class | Notes |
|-------|------|--------|---------------|-------|
| M1 | `NATIVE_ARCHITECTURE_CERTIFIED` | **OPEN** | HARD | Android `applicationId` ≠ Capacitor/iOS appId |
| M2 | `APP_SHELL_STABLE` | OPEN | DEVICE_REQUIRED | No fresh device cold/warm matrix |
| M3 | `DEEP_LINKS_CERTIFIED` | OPEN | EXTERNAL/DEVICE | AASA/App Links live verify |
| M4 | `AUTH_CERTIFIED` | OPEN | DEVICE_REQUIRED | Session + offline start |
| M5 | `OFFLINE_READY` | OPEN | NOT_STARTED | Strategy doc + route matrix |
| M6 | `MUSHAF_MOBILE_CERTIFIED` | OPEN | DEVICE_REQUIRED | 25/50/100 turns unproven |
| M7 | `PRAYER_NOTIFICATION_CERTIFIED` | OPEN | DEVICE_REQUIRED | STORE_100% HOLD |
| M8 | `PUSH_CERTIFIED` | OPEN | DEVICE_REQUIRED | |
| M9 | `ACCESSIBILITY_CERTIFIED` | OPEN | DEVICE_REQUIRED | VoiceOver/TalkBack |
| M10 | `DEVICE_MATRIX_COMPLETE` | OPEN | DEVICE_REQUIRED | |
| M11 | `PERFORMANCE_CERTIFIED` | OPEN | DEVICE_REQUIRED | |
| M12 | `STORE_READY` | OPEN | OWNER | Signing · ASC/Play · ID decision |
| M13 | `RELEASE_CANDIDATE_CERTIFIED` | OPEN | BLOCKED | Needs M1–M12 |
| M14 | Final report | **CHARTERED** | — | Skeleton live |

## Parallelism with UNIFIED web train

| Web phase | Mobile interaction |
|-----------|-------------------|
| U1 LHCI numeric | Independent — does not gate M* |
| U2 Token / U3 Theme / U4 Chrome | Helpful for WebView flicker; parallel prep only |
| U5–U13 | Must not block M6/M7 |

## Next executable slice (after charter merge)

1. M1 certification PR — inventory plugins/permissions/links + resolve or OWNER-document Android applicationId mismatch.  
2. M2 measurement pack — cold/warm/resume scripts + device log template.  
3. M6/M7 device protocols — ready packs while M1 CI runs.
