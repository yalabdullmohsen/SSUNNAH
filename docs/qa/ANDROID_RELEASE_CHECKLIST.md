# Android Release Checklist — Phase 6 (repository bounds)

| Item | Status | Notes |
|---|---|---|
| Gradle project present | PASS | `artifacts/majalis/android` |
| `applicationId` | `com.majlisilm.app` | **≠** Capacitor `com.yousef.majlisilm` → OWNER_ACTION |
| minSdk 24 / targetSdk 36 / compileSdk 36 | PASS | variables.gradle |
| versionName 1.0.0 / versionCode 1 | PASS | do not bump randomly |
| cleartext false / allowMixedContent false | PASS | capacitor config |
| webContentsDebuggingEnabled false | PASS | production config |
| Keystore path referenced | OWNER_ACTION / BLOCKED_CREDENTIAL | passwords via env placeholders |
| Exact alarm / notification permission behavior | DEVICE_REQUIRED | OEM variance |
| Reboot receivers | DEVICE_REQUIRED | |
| Release AAB/APK signed | BLOCKED_CREDENTIAL | |
| Play internal track | OWNER_ACTION | |
| Real device matrix | DEVICE_REQUIRED | |

Do not change applicationId or signing configs in this phase without explicit owner decision.
