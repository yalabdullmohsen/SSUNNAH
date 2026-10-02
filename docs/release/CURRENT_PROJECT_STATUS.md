# CURRENT PROJECT STATUS — سُنّة

**Updated:** 2026-10-03 (Batch A — U4 remasure + LHCI home unused-css closure)  
**Master closure register:** `docs/audit/SUNNAH_MASTER_CLOSURE_REGISTER.md` · **LOCKED**  
**iOS-only board:** `docs/audit/IOS_ONLY_CLOSURE_BOARD.md` · **`LIVE_TRUTH_LOCKED_IOS_ONLY`**  
**Boundary report (living):** `docs/audit/SUNNAH_COMPLETE_PRODUCT_RELEASE_BOUNDARY_REPORT.md`  
**Build 55 truth:** `docs/store-release/BUILD_55_TRACEABILITY.md`  
**License status:** `docs/mobile/LICENSE_CERTIFICATION_STATUS.md` · `LICENSE_CERTIFICATION_REQUIRED`  
**Mobile status:** `docs/mobile/MOBILE_READINESS_STATUS.md` · `MOBILE_PARTIALLY_READY` · Android **RETIRED**  
**Canonical readiness:** `docs/release/RELEASE_READINESS_TRUTH.md`  
**Device runbook:** `docs/audit/WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md`  
**Blockers:** `docs/release/PHASE_7_BLOCKER_REGISTER.md` · Master Closure Register · Owner Apple signing  
**Remaining problems (living inventory):** `docs/audit/SUNNAH_REMAINING_PROBLEMS_MASTER_COPYABLE.md`

## Live release truth (2026-10-02)

| Field | Value |
|---|---|
| `CURRENT_RELEASE_LIVE` | App Store **1.0** · `READY_FOR_SALE` |
| `NEXT_RELEASE_TESTFLIGHT_AVAILABLE` | TestFlight **1.0.1 (55)** · ASC UUID `a3fc6865-…` · `BUILT_FROM_MAIN_PLUS_VERSION_PIN` |
| `BUILD_55_DEVICE_CERTIFICATION_MISSING` | Physical-device evidence not attached |
| iOS tip versions (source) | `MARKETING_VERSION=1.0.1` · `CURRENT_PROJECT_VERSION=55` (App + Widget + Live Activity) |
| Auth (repository) | Keychain via `registerPlugin("SunnahAuthKeychain")` · signOut revokes then clears Cap + `majlis.auth.session.v1` · no client review password · Admin role via Admin API only |
| Auth (device) | `DEVICE_RECERTIFICATION_REQUIRED` · **not** `IOS_AUTH_CERTIFIED` · needs Build **≥ 56** |
| `REVIEW_CREDENTIAL_ROTATION_OWNER_ACTION` | Owner must rotate ASC review password (ASC notes only) |
| `CAPACITOR_AUTH_REQUIRES_DEVICE_RECERTIFICATION` | Next Archive must be build **> 55** containing Keychain + hardening (#2471–#2477) |
| Explicit non-claims | no `IOS_AUTH_CERTIFIED` · no `STORE_GO` · no `UNIFIED_100` · no `IOS_RELEASE_CANDIDATE_READY` without evidence |

## Repository tips (measured)

| Field | Value |
|---|---|
| `origin/main` tip | `c1cec798` — U4 hus/tab geometry (#2481); Batch A LHCI pending merge |
| Production `version.json` | `c1cec798` **MATCH** · `builtAt=2026-10-02T22:21:28.663Z` |
| Recent hardening | #2474 contrast · #2475 Keychain · #2476 signOut · #2477 FINAL_REPOSITORY_HARDENING (P0–P3 Accepted Truth = 0) |
| Next iOS Archive | **1.0.1 / ≥56** · tip must include hardening · `DEVICE_RECERTIFICATION_REQUIRED` |
| About surface | `/about` — حول التطبيق |
| Decision | **`WEB_RELEASED_NATIVE_HOLD`** · **`PROJECT_CLOSURE_PARTIAL`** · **iOS-only product** |
| Unification | **`UNIFIED_PARTIAL`** · U2 COMPLETE · U3 **`DARK_LIGHT_UNIFIED`** · U4 Home cold CLS residual · LHCI local closed pending tip MATCH · U7 Back **PASS** historically · U5/U6 at debt ceilings |
| Mobile | **`MOBILE_PARTIALLY_READY`** · Bundle `com.yousef.majlisilm` · Android **retired** |
| License | **`LICENSE_CERTIFICATION_REQUIRED`** · recitations **STREAM_ONLY** · Istanbul **CC0_ADHAN_REJECTED_QUALITY** (not in binary) |
| Store | **HOLD** for new submission · App Store 1.0 live · TF 1.0.1(55) available · no Play · no `STORE_GO` |
| Repo defects (Accepted Truth) | **P0=0 · P1=0 · P2=0 · P3=0** |
| Explicit non-claims | no `STORE GO` · no `CONTENT_CERTIFIED` · no `AUDIO_CERTIFIED` · no `UNIFIED_100` · no `MOBILE_READY` · no `DEVICE_TESTED` · no `WCAG CERTIFIED` · no `IOS_AUTH_CERTIFIED` · no `IOS_RELEASE_CANDIDATE_READY` |

## Active program

**`SUNNAH_FINAL_PRODUCT_UNIFICATION_AND_STORE_CLOSURE`**

| Phase | Target exit | Status |
|---|---|---|
| 0 Truth sync | `DOCUMENTATION_MATCH_CURRENT_MAIN` | **COMPLETE** (tip `c1cec798`) |
| 1 U4 Startup | `STARTUP_CHROME_STABLE` / `CHROME_FP_EQUALS_FINAL` | **NOT CLOSED** — remasure `c1cec798`: Prayer/Search/Quran/Mushaf PASS · Home cold CLS FAIL · see `U4_STARTUP_CHROME_REMEASURE_c1cec798.md` |
| 2 LHCI | `LHCI_HOME_MOBILE_CLOSED` | **LOCAL CLOSED** unused-css=0×3 · forced-reflow=1×3 · awaiting tip MATCH re-proof · see `LHCI_HOME_REMEASURE_BATCH_A.md` |
| 3 UI authority | BUTTON / CARD / BACK toward UNIFIED_100 | **PARTIAL** — Back PASS historically · buttons/cards at debt ceilings |
| 4 Route quality | priority routes feedback COMPLETE | **PARTIAL** — wave4 tested · stale/permission gaps remain |
| 5 Mushaf fluidity | measured plan only | **PREPARED** — `docs/mushaf/MUSHAF_FLUIDITY_PLAN.md` |
| 6 License matrix | owner decision prep | **PREPARED** — `docs/store-release/LICENSE_DECISION_MATRIX.md` |
| 7 iOS RC prep | checklist only · no Archive | **PREPARED** — `docs/store-release/IOS_RC_EXECUTION_PLAN.md` |

## T-034 Auth status

| Surface | Status |
|---|---|
| Client review credentials | **REMOVED** |
| Cap Supabase storage | **Keychain adapter in source** |
| Sign-out order | **FIXED** (revoke → clear) |
| Admin role updates | **Admin API only** |
| Build 55 binary | Prior contract — cannot certify new auth on 55 |
| Device certification | **OPEN** · requires build > 55 |

## Store readiness

**HOLD** (native App Store / Play Store)

## Remaining blocker classes

DEVICE_REQUIRED · OWNER_ACTION · BLOCKED_LICENSE · BLOCKED_SOURCE · BLOCKED_CREDENTIAL · KEEP_JUSTIFIED · MUSHAF_SPECIAL · PRAYER_SPECIAL · ADMIN_ONLY
