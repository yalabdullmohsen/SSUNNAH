# Build 55 — Version Traceability

| Field | Value |
|-------|-------|
| Marketing version | `1.0.1` |
| Build number | `55` |
| ASC UUID | `a3fc6865-2fee-461e-8fa0-52601ea63163` |
| ASC processingState | `VALID` (at upload) |
| Classification | **`BUILT_FROM_MAIN_PLUS_VERSION_PIN`** |
| Docs synced | 2026-10-02 · live web tip `0c4e808f` **MATCH** |

## Release surfaces (live truth)

| Surface | Status / Value |
|---------|----------------|
| `CURRENT_RELEASE_LIVE` | App Store Connect `1.0` · `READY_FOR_SALE` |
| `CURRENT_APP_STORE_RELEASE` | `1.0` (live) — **not** 1.0.1 |
| `NEXT_RELEASE_TESTFLIGHT_AVAILABLE` | TestFlight `1.0.1 (55)` · `NEXT_TESTFLIGHT_RELEASE` |
| `BUILD_55_DEVICE_CERTIFICATION_MISSING` | Physical-device evidence not attached |
| `origin/main` at TF upload day | `574c838a2` (web tip; pbx was still 1.0/54 before hardening) |
| Source of IPA | **Not a clean git commit** — Archive = `574c838a2` **plus** uncommitted `MARKETING_VERSION=1.0.1` / `CURRENT_PROJECT_VERSION=55` |
| Live web tip (now) | `0c4e808f` **MATCH** production `version.json` |

Do **not** claim Build 55 was produced from a git tag/commit that already contained 1.0.1/55.

## After repository hardening (merged on main)

| Claim | Value |
|-------|-------|
| Hardening chain | #2471 Keychain wiring · #2476 signOut order · #2477 FINAL_HARDENING |
| Live web | `version.json` **0c4e808f** MATCH |
| `project.pbxproj` tip | **1.0.1 / 55** for App + PrayerWidget + PrayerLiveActivity |
| Review credentials in client | removed (`NO_CLIENT_EMBEDDED_REVIEW_CREDENTIALS`) |
| Capacitor auth storage | Keychain adapter in source (`CAPACITOR_AUTH_STORAGE_HARDENED`) |
| Auth in Build 55 binary | **Does not include** Keychain adapter / credential removal / #2477 native fixes |
| Device status | `IOS_AUTH_REPOSITORY_HARDENED` · `DEVICE_RECERTIFICATION_REQUIRED` |
| Forbidden claim | Do **not** use `IOS_AUTH_CERTIFIED` until a build **> 55** passes physical device re-cert |

## Next iOS build requirement

1. Archive from tip **`0c4e808f` or newer `main`** that contains hardening (#2471–#2477).
2. Bump `CURRENT_PROJECT_VERSION` to **≥ 56** (strictly greater than 55).
3. Keep marketing train rules satisfied (1.0.1 or next allowed version).
4. Re-run physical device auth certification (Login / Logout / Recovery / Session / Deep-link).
5. Owner: rotate App Store review password (`REVIEW_CREDENTIAL_ROTATION_OWNER_ACTION`) and paste only into ASC Review Notes.
6. Widget/LA: confirm App Group on store profiles before TF export.

## Gate

`artifacts/majalis/src/lib/__tests__/ios-build-version-traceability-gate.test.ts`
