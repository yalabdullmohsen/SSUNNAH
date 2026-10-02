# T-049 — TestFlight Internal Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-049 TESTFLIGHT_INTERNAL` |
| Date (UTC) | `2026-10-02` |
| Base | T-048 tip (`APP_STORE_READINESS_COMPLETE`) |
| Evidence | `docs/audit/evidence/t049-testflight-internal/` |
| Verdict | **FAIL** |
| Exit | **`TESTFLIGHT_INTERNAL_NOT_CERTIFIED`** |

Prerequisite tip: `docs/audit/APP_STORE_READINESS_REPORT.md`.  
Forbidden this phase: `IOS_RELEASE_CANDIDATE_READY` · Final Closure.

**Correction to prompt “CURRENT STATE”:** Device Matrix tip remains `IOS_DEVICE_MATRIX_INCOMPLETE`; Performance tip remains `MOBILE_PERFORMANCE_NOT_CERTIFIED`. Not used as PASS inputs.

---

## 1. Store Source Commit

| Field | Value |
|-------|-------|
| `STORE_SOURCE_COMMIT` | `8be8ed1b577d257b82be2893430c5626242132da` |
| File | `docs/store-release/STORE_SOURCE_COMMIT.txt` |
| Version (`MARKETING_VERSION`) | **1.0** |
| Build (`CURRENT_PROJECT_VERSION`) | **54** |
| Pin held during validation | **yes** (unchanged for archive/export/boundary) |

---

## 2. Archive Validation

| Step | Result | Evidence |
|------|--------|----------|
| Clean Xcode Archive (`xcodebuild archive` Release) | **PASS** (local) | `archive-attempt.log` · `/tmp/sunnah-t049.xcarchive` |
| Signing identity used | Apple **Development** only | `codesign-identities.txt` |
| Capacitor Sync this cycle | **NOT_RUN** (pin frozen; no product sync required for FAIL exit) | — |
| Pod Resolution | **N/A** (SPM / CapApp-SPM; no CocoaPods) | `xcodebuild -list` |
| Export App Store Connect IPA | **FAIL** | `export-attempt.log` |
| Validate App (store export) | **FAIL** | same |

### Export errors (blocking)

1. No profiles for `com.yousef.majlisilm.PrayerWidget`  
2. Store profiles for App + `PrayerLiveActivity` missing **App Groups** / `group.com.yousef.majlisilm`

**Board Archive (TestFlight-ready):** **FAIL** — local `.xcarchive` alone is insufficient without successful store export/upload.

---

## 3. Installation Validation

| Device | Result |
|--------|--------|
| iPhone (TestFlight Internal) | **FAIL** — no TF build uploaded |
| iPad (TestFlight Internal) | **FAIL** — no TF build uploaded |

---

## 4. Smoke Validation

Required routes on TF install: Home · Search · Quran Hub · Mushaf · Prayer · Settings · Account.

| Result | **FAIL** |
|--------|----------|
| Reason | No TestFlight install — smoke not executed on certified TF binary |

---

## 5. Device Validation

| Feature | Result |
|---------|--------|
| Widgets | UNPROVEN_ON_TF |
| Watch Sync | **NOT_APPLICABLE** (no Watch target — architecture cert) |
| Live Activity | UNPROVEN_ON_TF |
| Deep Links | UNPROVEN_ON_TF |
| Notifications | UNPROVEN_ON_TF |
| Offline | UNPROVEN_ON_TF |
| Authentication | UNPROVEN_ON_TF |
| Crash review (launch/route/auth/mushaf/prayer) | **UNPROVEN** |

---

## 6. Boundary Validation

| Check | Result |
|-------|--------|
| Release flavor UNKNOWN = 0 | **PASS** |
| Audio allowlist locked | **PASS** |
| STREAM_ONLY recitations | **PASS** |
| Store content clearance tip | **PASS** (`STORE_RELEASE_CONTENT_CLEARED`) |

Evidence: `boundary-check.log` · inventory snapshot.

**Board Boundary:** **PASS**

---

## 7. Owner Actions

| Action | Why |
|--------|-----|
| Register App Group `group.com.yousef.majlisilm` on App + LA + Widget App IDs | Export failed without capability on store profiles |
| Refresh App Store provisioning profiles (incl. PrayerWidget) | Missing widget profile |
| Confirm Apple Distribution / ASC upload rights | Development-only identity present on agent host |
| Upload build 54 (or next) to TestFlight Internal from pinned commit | No TF artifact |
| Install + smoke on physical iPhone and iPad | Required for Install/Smoke PASS |
| Do not change `STORE_SOURCE_COMMIT` mid-cycle after re-pin | Process |

Agents must not claim these were executed without ASC/TestFlight artifacts.

---

## 8. Exit Decision

| Board | Required | Actual |
|-------|----------|--------|
| Archive (TF-exportable) | PASS | **FAIL** |
| Install | PASS | **FAIL** |
| Smoke | PASS | **FAIL** |
| Boundary | PASS | **PASS** |

| Exit | `TESTFLIGHT_INTERNAL_NOT_CERTIFIED` |
|------|-------------------------------------|
| Final Decision | **FAIL** |

Gate: `pnpm --filter @workspace/majalis run test:testflight-internal`.

Do **not** start `IOS_RELEASE_CANDIDATE_READY` / Final Closure until `TESTFLIGHT_INTERNAL_CERTIFIED`.
