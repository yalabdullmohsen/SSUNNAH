# CURRENT PROJECT STATUS — سُنّة

**Updated:** 2026-10-02 (BUILD_55 post-upload security + version traceability hardening)  
**Master closure register:** `docs/audit/SUNNAH_MASTER_CLOSURE_REGISTER.md` · **LOCKED**  
**iOS-only board:** `docs/audit/IOS_ONLY_CLOSURE_BOARD.md` · **`LIVE_TRUTH_LOCKED_IOS_ONLY`**  
**Boundary report (living):** `docs/audit/SUNNAH_COMPLETE_PRODUCT_RELEASE_BOUNDARY_REPORT.md`  
**Build 55 truth:** `docs/store-release/BUILD_55_TRACEABILITY.md`  
**License status:** `docs/mobile/LICENSE_CERTIFICATION_STATUS.md` · `LICENSE_CERTIFICATION_REQUIRED`  
**Mobile status:** `docs/mobile/MOBILE_READINESS_STATUS.md` · `MOBILE_PARTIALLY_READY` · Android **RETIRED**  
**Canonical readiness:** `docs/release/RELEASE_READINESS_TRUTH.md`  
**Device runbook:** `docs/audit/WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md`  
**Blockers:** `docs/release/PHASE_7_BLOCKER_REGISTER.md` · Master Closure Register · Owner Apple signing

## Live release truth (2026-10-02)

| Field | Value |
|---|---|
| `CURRENT_RELEASE_LIVE` | App Store **1.0** · `READY_FOR_SALE` |
| `NEXT_RELEASE_TESTFLIGHT_AVAILABLE` | TestFlight **1.0.1 (55)** · ASC UUID `a3fc6865-…` · `BUILT_FROM_MAIN_PLUS_VERSION_PIN` |
| `BUILD_55_DEVICE_CERTIFICATION_MISSING` | Physical-device evidence not attached |
| iOS tip versions (source) | `MARKETING_VERSION=1.0.1` · `CURRENT_PROJECT_VERSION=55` (App + Widget + Live Activity) |
| Auth (repository) | `IOS_AUTH_REPOSITORY_HARDENED` · Keychain-backed Cap storage · no client review password |
| Auth (device) | `DEVICE_RECERTIFICATION_REQUIRED` · **not** `IOS_AUTH_CERTIFIED` |
| `REVIEW_CREDENTIAL_ROTATION_OWNER_ACTION` | Owner must rotate ASC review password after merge (ASC notes only) |
| `CAPACITOR_AUTH_REQUIRES_DEVICE_RECERTIFICATION` | Next Archive must be build **> 55** containing this hardening |
| Explicit non-claims | no `IOS_AUTH_CERTIFIED` · no `STORE_GO` · no device PASS on Build 55 auth fix |

## Repository tips (measured)

| Field | Value |
|---|---|
| `origin/main` tip (pre hardening PR) | `574c838a2` — T-050 NOT_READY (#2470) |
| Production `version.json` | verify after merge (web auto-deploy) |
| About surface | `/about` — حول التطبيق |
| Decision | **`WEB_RELEASED_NATIVE_HOLD`** · **`PROJECT_CLOSURE_PARTIAL`** · **iOS-only product** |
| Unification | **`UNIFIED_PARTIAL`** · U2 COMPLETE · U3 **`DARK_LIGHT_UNIFIED`** |
| Mobile | **`MOBILE_PARTIALLY_READY`** · Bundle `com.yousef.majlisilm` · Android **retired** |
| License | **`LICENSE_CERTIFICATION_REQUIRED`** · recitations **STREAM_ONLY** · Istanbul **CC0_ADHAN_CANDIDATE** |
| Store | **HOLD** for new submission · App Store 1.0 live · TF 1.0.1(55) available · no Play · no `STORE_GO` |
| Explicit non-claims | no `STORE GO` · no `CONTENT_CERTIFIED` · no `AUDIO_CERTIFIED` · no `UNIFIED_100` · no `MOBILE_READY` · no `DEVICE_TESTED` · no `WCAG CERTIFIED` · no `IOS_AUTH_CERTIFIED` |

## T-034 Auth status (post repository hardening)

| Surface | Status |
|---|---|
| Client review credentials | **REMOVED** · `NO_CLIENT_EMBEDDED_REVIEW_CREDENTIALS` |
| Cap Supabase storage | **Keychain adapter in source** · `CAPACITOR_AUTH_STORAGE_HARDENED` |
| Build 55 binary | Still prior contract (localStorage) — cannot certify new auth on 55 |
| Device certification | **OPEN** · requires next build > 55 |

## Closure program WAVE7→13 (merged + deployed)

| Wave | PR | SHA |
|---|---|---|
| 7 Identity | #2385 | `ae78fe56` |
| 8 Cards | #2386 | `77ae6759` |
| 9 Admin | #2387 | `7304cbeb` |
| 10 Mushaf controls | #2388 | `2aa5dc8a` |
| 11 Route quality | #2389 | `12fba46c` |
| 12 Index CSS | #2390 | `e29f2cb0` |
| 13 Device evidence prep | #2391 | `aa94c759` |

## Store readiness

**HOLD** (native App Store / Play Store)

## Remaining blocker classes

DEVICE_REQUIRED · OWNER_ACTION · BLOCKED_LICENSE · BLOCKED_SOURCE · BLOCKED_CREDENTIAL · KEEP_JUSTIFIED · MUSHAF_SPECIAL · PRAYER_SPECIAL · ADMIN_ONLY
