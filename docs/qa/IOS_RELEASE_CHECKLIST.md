# iOS Release Checklist — Phase 6 (repository bounds)

| Item | Status | Notes |
|---|---|---|
| Xcode project present | PASS | `artifacts/majalis/ios/App` |
| Bundle ID `com.yousef.majlisilm` | PASS | pbxproj |
| Capacitor appId match | PASS | same as Bundle ID |
| `test:ios-gates` | PASS when CI green | public folder hygiene |
| Background audio mode declared | PASS | apple-review / 2.5.4 gates |
| Local + Push presentation options | PASS | capacitor.config |
| Info.plist uses $(PRODUCT_BUNDLE_IDENTIFIER) | PASS | |
| Config.xcconfig secrets empty in repo | PASS | placeholders only |
| Simulator build | BLOCKED_ENVIRONMENT / NOT_RUN | depends on host Xcode |
| Archive | OWNER_ACTION | needs signing team |
| Provisioning / certificates | BLOCKED_CREDENTIAL | |
| TestFlight upload | OWNER_ACTION | |
| Universal links / AASA live verify | EXTERNAL_ACTION | DNS/hosting |
| Real device matrix | DEVICE_REQUIRED | Mushaf + Prayer |

Do not change signing team, Bundle ID, or create certificates in this phase.
