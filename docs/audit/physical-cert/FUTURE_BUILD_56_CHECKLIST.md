# FUTURE_BUILD_56_CHECKLIST — prepare only (do not execute in this task)

**Status:** `FUTURE_BUILD_REQUIRED` checklist  
**Forbidden in this task:** Archive · IPA export · TestFlight upload · ASC submit · Signing/Provisioning edits · Bundle ID / App Group changes

## Owner checklist (future session)

```text
[ ] Confirm ASC review submission left untouched
[ ] Confirm origin/main tip desired for Archive (currently prepared against 631dcc01e+)
[ ] Confirm Production version.json MATCH for web tip if web claims needed
[ ] Set MARKETING_VERSION per train rules (1.0.1 or next allowed)
[ ] Set CURRENT_PROJECT_VERSION ≥ 56 for App + PrayerWidget + PrayerLiveActivity
[ ] Confirm App Group group.com.yousef.majlisilm on store profiles (App/Widget/LA)
[ ] Archive from clean tree containing Keychain + hardening (#2471–#2477+)
[ ] Export / upload TestFlight (owner only)
[ ] Install on physical iPhone primary + secondary + iPad
[ ] Execute AUTH_DEVICE_RUNBOOK.md
[ ] Execute tip-aligned T033 / Widget / LA / Push rows
[ ] Ingest evidence pack; pass validate-physical-evidence-pack.mjs
[ ] Open Evidence PR only after real artifacts exist
[ ] Rotate ASC review password (REVIEW_CREDENTIAL_ROTATION_OWNER_ACTION)
```

## Explicit non-actions now

No Build number increment in repo during this prep task.  
pbx remains 55 until owner Archive session.
