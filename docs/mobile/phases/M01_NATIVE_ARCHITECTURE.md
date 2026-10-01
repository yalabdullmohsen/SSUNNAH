# M1 — Native Architecture Certification

| Field | Value |
|-------|-------|
| Program | MRMP v1 |
| Exit | `NATIVE_ARCHITECTURE_CERTIFIED` |
| Status | OPEN |

## Scope
`capacitor.config.*` · `ios/App` · `android/app` · plugins · permissions · associated domains · universal/app links.

## Exit evidence
- Plugin/permission inventory table
- Bundle ID / applicationId / appId alignment **or** OWNER exception doc
- AASA / assetlinks pointers recorded
- No unknown native crash-on-launch in simulator smoke (when host allows)

## Hard blockers
- Android `applicationId` ≠ Capacitor/iOS appId (live at charter)
- Missing PrivacyInfo / entitlements regressions

## Out
Expo package · web-only UNIFIED phases · store upload

