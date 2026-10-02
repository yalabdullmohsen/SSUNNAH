# CURRENT PROJECT STATUS — سُنّة

**Updated:** 2026-10-03 (SUNNAH_FINAL_CLOSURE_PROGRAM — A–I execution)  
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
| `origin/main` tip | `f9ac3572` — LHCI unused-css defer identity (#2482); FINAL_CLOSURE branch pending tip MATCH |
| Production `version.json` | `f9ac3572` **MATCH** · `builtAt=2026-10-02T23:08:40.375Z` (pre–final-closure) |
| Recent hardening | #2474–#2477 · #2480 U4 · #2481 hus · #2482 LHCI defer · do not reopen |
| Next iOS Archive | **1.0.1 / ≥56** · tip must include hardening · `DEVICE_RECERTIFICATION_REQUIRED` |
| About surface | `/about` — حول التطبيق |
| Decision | **`WEB_RELEASED_NATIVE_HOLD`** · **`PROJECT_CLOSURE_PARTIAL`** · **iOS-only product** |
| Unification | **`UNIFIED_PARTIAL`** · U4 local CLS≈0.0003 · LHCI local closed · prod remasure after tip MATCH · U7 Back historically PASS · buttons/cards debt improved |
| Mobile | **`MOBILE_PARTIALLY_READY`** · Bundle `com.yousef.majlisilm` · Android **retired** |
| License | **`LICENSE_CERTIFICATION_REQUIRED`** · packet: `docs/store-release/LICENSE_EXECUTION_PACKET.md` |
| Store | **HOLD** for new submission · App Store 1.0 live · TF 1.0.1(55) available · no Play · no `STORE_GO` |
| Repo defects (Accepted Truth) | **P0=0 · P1=0 · P2=0 · P3=0** |
| Explicit non-claims | no `STORE GO` · no `CONTENT_CERTIFIED` · no `AUDIO_CERTIFIED` · no `UNIFIED_100` · no `MOBILE_READY` · no `DEVICE_TESTED` · no `WCAG CERTIFIED` · no `IOS_AUTH_CERTIFIED` · no `IOS_RELEASE_CANDIDATE_READY` |

## Active program

**`SUNNAH_FINAL_CLOSURE_PROGRAM` (A→I)**

| Phase | Target exit | Status |
|---|---|---|
| A Startup chrome | `STARTUP_CHROME_STABLE` | **LOCAL PASS** Home CLS≈0.000323 · 5 routes <0.01 · awaiting tip MATCH remasure |
| B LHCI Home | `LHCI_HOME_MOBILE_CLOSED` | **LOCAL PASS** unused-css 0×3 · forced-reflow 1×3 · prod f9ac3572 was 150–320 / 1/1/0 |
| C Button authority | `BUTTON_AUTHORITY_IMPROVED` | **LOCAL** rawButtonFiles 109→107 · elements 482→471 |
| D Card authority | `CARD_AUTHORITY_IMPROVED` | **LOCAL** shadows 1108→1107 · radius 1222→1221 |
| E Route feedback | `ROUTE_FEEDBACK_COMPLETE` | **EVIDENCE** `docs/audit/ROUTE_FEEDBACK_PRIORITY_EVIDENCE.json` |
| F Mushaf fluidity | plan only | **READY** `docs/mushaf/MUSHAF_FLUIDITY_IMPLEMENTATION_PLAN.md` |
| G Docs sync | tip=prod=docs | **PARTIAL** until tip MATCH after merge |
| H License packet | classification | **READY** `docs/store-release/LICENSE_EXECUTION_PACKET.md` |
| I Build 56 | checklist only | **READY** `docs/store-release/BUILD_56_EXECUTION_PACKET.md` · no Archive |

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
