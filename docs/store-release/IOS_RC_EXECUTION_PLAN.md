# IOS_RC_EXECUTION_PLAN — Prepare only (no Archive / no upload)

| Field | Value |
|-------|-------|
| Tip pin (minimum) | `0c4e808f` or newer `main` containing #2471–#2477 |
| Marketing | `1.0.1` (or next allowed) |
| Build number | **≥ 56** (strictly > 55) |
| Bundle | `com.yousef.majlisilm` |
| Explicit | Agents do **not** build, sign, or upload |

## Checklist before Archive

1. Record `STORE_SOURCE_COMMIT` = exact tip SHA after green CI.
2. Bump `CURRENT_PROJECT_VERSION` ≥ 56 in App + PrayerWidget + PrayerLiveActivity.
3. Confirm App Group `group.com.yousef.majlisilm` on **store** profiles for App + Widget + Live Activity.
4. Confirm PrayerWidget App Store profile exists.
5. Owner: rotate ASC review password · paste only into ASC Review Notes.
6. License matrix decisions applied to Store flavor (GRANT/STRIP/STREAM_ONLY).
7. No UNKNOWN audio/fonts/bodies in Store RC binary.

## Device matrix preparation (run after TF install)

| Suite | Prep artifact | Exit name |
|-------|---------------|-----------|
| Auth | Login/Logout/Recovery/Session/Deep-link | `IOS_AUTH_CERTIFIED` |
| App shell | Cold/warm launch · chrome · rotation | `IOS_APP_SHELL_STABLE` |
| Deep links | AASA + universal links | `IOS_DEEP_LINKS_CERTIFIED` |
| Mushaf | Turn latency · font · bookmarks | `MUSHAF_IOS_CERTIFIED` |
| Prayer / Adhan | Times · notification · sound policy | `IOS_PRAYER_ADHAN_CERTIFIED` |
| Push | APNs delivery | `IOS_PUSH_CERTIFIED` |
| Accessibility | VoiceOver pass rows | `IOS_ACCESSIBILITY_CERTIFIED` |
| Performance | MRMP M11 rows | `MOBILE_PERFORMANCE_CERTIFIED` |

Runbooks: `docs/audit/WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md` · `DEVICE_QA_REGISTER.md`

## Forbidden until evidence

```text
IOS_RELEASE_CANDIDATE_READY
TESTFLIGHT_INTERNAL_CERTIFIED
STORE_GO
IOS_AUTH_CERTIFIED
```
