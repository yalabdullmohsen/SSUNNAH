# PR W3 — Widget Data Truth Hardening

TASK_CLASSIFICATION: IOS_ONLY_WITH_SHARED_DATA

WEB_IMPACT: AuthProvider hooks only (republish on logout/account-switch; no Web WidgetKit)

IOS_APPLICATION_IMPACT: App Group envelope + prayer classification + plugin fields

APP_STORE_PRODUCT_IMPACT: none in this PR (Build 55 unchanged; FUTURE_IOS_UPDATE_REQUIRED)

SHARED_PLATFORM_IMPACT: shared widget-data contracts + auth lifecycle

## Required outputs

ACCOUNT_SWITCH_WIDGET_SAFE

LOGOUT_WIDGET_SAFE

STALE_WIDGET_DATA_SAFE

SCHEMA_FORWARD_FAILURE_ISOLATED

PERMISSION_REVOCATION_ACTIONABLE

## Contracts

- Logout and account-switch call `republishSafeWidgetDataAfterAuthChange`.
- Progress snapshot is zeroed before safe envelope republish.
- Account-linked progress counters are stripped from the published envelope.
- Privacy scan (`assertPublicSafeWidgetJson`) rejects tokens/email/phone/secrets.
- Stale prayer payloads disable live countdown (`allowsLiveCountdown` only for `validData`).
- Future domain `schemaVersion` above current schema fails that domain only (`decodeIsolated`).
- `permissionState` denied/revoked/REQUIRES_PERMISSION → `permissionRequired` presentation with actionable Arabic copy.
- Missing custom selection / deleted bookmark → `REQUIRES_CONFIGURATION` / `configurationRequired`.
- Build number remains 55. No Archive / IPA / TestFlight / App Store action.

## Physical validation

DEVICE_REQUIRED for live Home Screen / Lock Screen / StandBy proof after a future native binary.
