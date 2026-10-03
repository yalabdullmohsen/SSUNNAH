# BUILD_TO_TEST_CONTRACT

**Authority:** Do not certify a fix on a Build that predates the fix.  
**Source tip (repo):** `631dcc01e` · pbx still `MARKETING_VERSION=1.0.1` / `CURRENT_PROJECT_VERSION=55`  
**Binary Train A:** App Store `1.0` live (+ any update currently under Apple review — owner-declared; do not modify)  
**Binary Train B:** TestFlight `1.0.1 (55)` — predates Keychain/signOut/hardening (#2471–#2477) in the shipped binary  
**Binary Train C (future):** Build `≥56` from main containing hardening — **not created in this task**

## Build identity rules

| Symbol | Meaning |
|--------|---------|
| `APP_STORE_LIVE_1_0` | Public App Store 1.0 |
| `ASC_REVIEW_UPDATE` | Whatever binary Apple is reviewing now (owner-declared; agent must not alter) |
| `TF_55` | TestFlight 1.0.1 (55) |
| `FUTURE_GE_56` | Next Archive only |

## Eligibility classes

`CAN_TEST_ON_CURRENT_REVIEW_BUILD` — smoke/layout only; never claims post-hardening fixes  
`CAN_TEST_ON_BUILD_55` — same as TF_55; useful for baseline UX/smoke; **not** auth/Keychain cert  
`REQUIRES_FUTURE_BUILD_GE_56` — any test that proves post-55 native hardening or later client native fixes  
`NOT_APPLICABLE` — Android / Expo / retired paths / AASA-excluded UL auth/*

## Matrix

```text
TEST_ID                              | CLASS
-------------------------------------+----------------------------------
T040-HOME-SMOKE                      | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-SEARCH-SMOKE                    | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-QURAN-HUB-SMOKE                 | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-MUSHAF-BASIC-SMOKE              | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-PRAYER-BASIC-SMOKE              | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-LESSONS-SMOKE                   | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-ACCOUNT-SMOKE                   | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-SETTINGS-SMOKE                  | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-NAV-LAYOUT                      | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-THEME-RTL                       | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T040-IPAD-SPLIT                      | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T033-UL-SMOKE-BASELINE               | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T033-SCHEME-SMOKE-BASELINE           | CAN_TEST_ON_BUILD_55 | CAN_TEST_ON_CURRENT_REVIEW_BUILD
T033-AASA-NETWORK                    | REPOSITORY/NETWORK (not a build binary claim)
T033-UL-CERT-FULL                    | REQUIRES_FUTURE_BUILD_GE_56  (if cert claims post-55 fixes)
T033-AUTH-CALLBACK-DEVICE            | REQUIRES_FUTURE_BUILD_GE_56  (Keychain/session)
AUTH-FRESH-INSTALL                   | REQUIRES_FUTURE_BUILD_GE_56
AUTH-LOGIN-SESSION                   | REQUIRES_FUTURE_BUILD_GE_56
AUTH-FORCE-CLOSE-RESTORE             | REQUIRES_FUTURE_BUILD_GE_56
AUTH-REBOOT-RESTORE                  | REQUIRES_FUTURE_BUILD_GE_56
AUTH-TOKEN-REFRESH                   | REQUIRES_FUTURE_BUILD_GE_56
AUTH-LOGOUT-REVOKE                   | REQUIRES_FUTURE_BUILD_GE_56
AUTH-LOGOUT-FORCE-CLOSE              | REQUIRES_FUTURE_BUILD_GE_56
AUTH-RECOVERY                        | REQUIRES_FUTURE_BUILD_GE_56
AUTH-LEGACY-STORAGE-RECOVERY         | REQUIRES_FUTURE_BUILD_GE_56
AUTH-KEYCHAIN-MIGRATION              | REQUIRES_FUTURE_BUILD_GE_56
WGT-HOME-FAMILIES-BASELINE           | CAN_TEST_ON_BUILD_55 (UI presence); reload/AppGroup cert → GE_56 if claiming post-55
WGT-RELOAD-APPGROUP                  | REQUIRES_FUTURE_BUILD_GE_56 when certifying current main tip behavior
LA-START-UPDATE-END                   | REQUIRES_FUTURE_BUILD_GE_56 for tip-aligned cert
MUSHAF-TURNS-25/50/100               | CAN_TEST_ON_BUILD_55 for baseline; tip-aligned cert → GE_56 preferred
PRAYER-LOCAL-NOTIF                   | CAN_TEST_ON_BUILD_55 baseline
PRAYER-REMOTE-APNS                   | REQUIRES_FUTURE_BUILD_GE_56 for tip-aligned cert (separate from local)
A11Y-VOICEOVER                       | CAN_TEST_ON_BUILD_55 baseline; tip-aligned → GE_56 preferred
PERF-NUMERIC                         | Must declare exact Build; tip-aligned → GE_56 preferred
ANDROID / EXPO OFFLINE #1791         | NOT_APPLICABLE
SUNNAH:// OS SCHEME                  | NOT_APPLICABLE (not registered; notification path only)
HTTPS UL /auth/*                     | NOT_APPLICABLE (AASA exclude)
```

## Hard rules

1. Baseline smoke on `TF_55` / review build may record `PASS`/`FAIL` for UX only with Build=`55` (or review build number) declared.  
2. Any row that claims Keychain, logout/revoke, post-hardening deep-link fix, tip Widget/LA reload, or tip-aligned native cert **must** use Build `≥56`.  
3. Gate rejects PASS when `requiredBuildClass=FUTURE_GE_56` and `appBuild < 56`.  
4. Gate rejects PASS when `runtime=simulator` and `physicalRequired=true`.

## Exit

```text
BUILD_TO_TEST_CONTRACT_READY
```
