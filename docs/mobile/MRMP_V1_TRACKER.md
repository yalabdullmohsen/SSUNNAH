# MRMP v1 Tracker

| Updated | 2026-10-01 |
| Program tip (charter) | branch `cursor/mrmp-v1-program-charter` |
| Web tip at charter | `origin/main` = `2c8aa1ae` · production MATCH |
| Program verdict | **MOBILE_PARTIALLY_READY** (shell exists · store/device evidence incomplete) |

## Phase board

| Phase | Exit | Status | Blocker class | Notes |
|-------|------|--------|---------------|-------|
| M1 | `NATIVE_ARCHITECTURE_CERTIFIED` | **OPEN** | HARD | Android `applicationId` ≠ Capacitor/iOS appId |
| M2 | `APP_SHELL_STABLE` | **FAIL / OPEN** | DEVICE_REQUIRED | T-032 Simulator: Home cold/warm/resume PASS · Deep Link+Split View FAIL → `IOS_APP_SHELL_NOT_STABLE` |
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

## Related expansion train

| Doc | Status |
|-----|--------|
| `SUNNAH_MOBILE_FIRST_EXPANSION_MASTERPLAN.md` | `MOBILE_FIRST_MASTERPLAN_COMPLETE` |
| `CONTENT_LICENSE_CERTIFICATION.md` | `LICENSE_CERTIFICATION_REQUIRED` |
| `ADHAN_AUDIO_AUDIT.md` | `AUDIO_LICENSE_PARTIAL` |

Expansion does **not** replace M1–M13 evidence. Store still blocked by MRMP + license gates.

## Next executable slice (after charter merge)

1. M1 certification PR — inventory plugins/permissions/links + resolve or OWNER-document Android applicationId mismatch.  
2. MF1 shared native core + MF-AUDIO-1 registry gaps (independent PRs).  
3. M2 measurement pack — cold/warm/resume scripts + device log template.  
4. M6/M7 device protocols — ready packs while M1 CI runs.
