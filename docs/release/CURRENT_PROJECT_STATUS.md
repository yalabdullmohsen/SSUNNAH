# CURRENT PROJECT STATUS — سُنّة

**Updated:** 2026-10-03 (VISUAL_SYSTEM_UNIFICATION_FINAL_WAVE)  
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

## Live release truth (2026-10-03)

| Field | Value |
|---|---|
| `CURRENT_RELEASE_LIVE` | App Store **1.0** · `READY_FOR_SALE` |
| `NEXT_RELEASE_TESTFLIGHT_AVAILABLE` | TestFlight **1.0.1 (55)** · ASC UUID `a3fc6865-…` · `BUILT_FROM_MAIN_PLUS_VERSION_PIN` |
| `BUILD_55_DEVICE_CERTIFICATION_MISSING` | Physical-device evidence not attached |
| iOS tip versions (source) | `MARKETING_VERSION=1.0.1` · `CURRENT_PROJECT_VERSION=55` (App + Widget + Live Activity) |
| Auth (repository) | Keychain via `registerPlugin("SunnahAuthKeychain")` · signOut revokes then clears Cap + `majlis.auth.session.v1` · no client review password · Admin role via Admin API only |
| Auth (device) | `DEVICE_RECERTIFICATION_REQUIRED` · **not** `IOS_AUTH_CERTIFIED` · needs Build **≥ 56** |
| `REVIEW_CREDENTIAL_ROTATION_OWNER_ACTION` | Owner must rotate ASC review password (ASC notes only) |
| `CAPACITOR_AUTH_REQUIRES_DEVICE_RECERTIFICATION` | Next Archive must be build **> 55** containing Keychain + hardening |
| Explicit non-claims | no `IOS_AUTH_CERTIFIED` · no `STORE_GO` · no `UNIFIED_100` · no `IOS_RELEASE_CANDIDATE_READY` without evidence |

## Repository tips (measured)

| Field | Value |
|---|---|
| `origin/main` tip (pre this endgame PR) | `9978a0d3` |
| Production `version.json` | `9978a0d3` **MATCH** · `builtAt=2026-10-03T02:13:15.524Z` |
| Batch A (prod) | Home CLS **0.0004** · unused-css **0/0/0** · forced-reflow **1/1/1** · `STARTUP_CHROME_STABLE` · `LHCI_HOME_MOBILE_CLOSED` |
| Next iOS Archive | **1.0.1 / ≥56** · tip must include hardening · `DEVICE_RECERTIFICATION_REQUIRED` |
| About surface | `/about` — حول التطبيق |
| Decision | **`WEB_RELEASED_NATIVE_HOLD`** · **`PROJECT_CLOSURE_PARTIAL`** · **iOS-only product** |
| Unification | **`UNIFIED_PARTIAL`** · U4/LHCI closed on prod · buttons/cards improved this endgame |
| Mobile | **`MOBILE_PARTIALLY_READY`** · Bundle `com.yousef.majlisilm` · Android **retired** |
| License | **`LICENSE_CERTIFICATION_REQUIRED`** · packet: `docs/store-release/LICENSE_EXECUTION_PACKET.md` |
| Store | **HOLD** for new submission · App Store 1.0 live · TF 1.0.1(55) available · no Play · no `STORE_GO` |
| Repo defects (Accepted Truth) | **P0=0 · P1=0 · P2=0 · P3=0** |
| Explicit non-claims | no `STORE GO` · no `CONTENT_CERTIFIED` · no `AUDIO_CERTIFIED` · no `UNIFIED_100` · no `MOBILE_READY` · no `DEVICE_TESTED` · no `WCAG CERTIFIED` · no `IOS_AUTH_CERTIFIED` · no `IOS_RELEASE_CANDIDATE_READY` |

## Visual unification

`VISUAL_SYSTEM_UNIFICATION_FINAL_WAVE` — `docs/audit/VISUAL_SYSTEM_UNIFICATION_WAVE_REPORT.md`  
Metrics vs `origin/main`: hexInCss 8855→7026 · borderRadiusPx 1202→456 · boxShadow 1047→1026 · sfTokenRefs 794→1006 · btnHex 1698→1184 · **UNIFIED_PARTIAL** (closer to UNIFIED_100; not claimed).

Phases I–L: `docs/audit/VISUAL_IJKL_BUTTON_FORM_IDENTITY_REPORT.md` · `docs/design/FORM_AUTHORITY_MAP.md` · rawButtonFiles 105→102 · rawButtonElements 463→457 · façades `LinkButton`/`ToggleButton` · FORM map APPROVED/LEGACY/SPECIAL_CASE.

Phases M–O: `docs/audit/VISUAL_MNO_TABLE_LIST_DATA_REPORT.md` · TABLE/LIST/DATA maps · `ListSystem` façades · `.ss-data-table` · UniversitiesCompare → `ui/table` · hexInCss →7025.

## Endgame phases (A–H)

| Phase | Target exit | Status |
|---|---|---|
| A Startup + LHCI | `STARTUP_CHROME_STABLE` + `LHCI_HOME_MOBILE_CLOSED` | **SUCCESS** prod MATCH `9978a0d3` · CLS 0.0004 · unused-css 0×3 · reflow 1×3 |
| B Button authority | `BUTTON_AUTHORITY_IMPROVED` | **SUCCESS** rawButtonFiles 107→105 · elements 471→463 · ceilings lowered |
| C Card authority | `CARD_AUTHORITY_IMPROVED` | **SUCCESS** borderRadiusPx 1221→1202 · boxShadowDecls 1107→1047 (removed redundant `box-shadow:none`) |
| D Route feedback | `ROUTE_FEEDBACK_COMPLETE` | **SUCCESS** evidence for `/` `/search` `/quran-hub` `/mushaf` `/prayer-times` `/lessons` `/settings` |
| E Mushaf fluidity | plan only | **SUCCESS** `docs/mushaf/MUSHAF_FLUIDITY_IMPLEMENTATION_PLAN.md` · DEVICE_REQUIRED for wall-clock |
| F Docs sync | tip=prod=docs | **SUCCESS** this file aligned to prod MATCH (refresh tip after endgame merge) |
| G License packet | classification | **SUCCESS** `docs/store-release/LICENSE_EXECUTION_PACKET.md` · OWNER_ACTION_REQUIRED for accept/replace/remove |
| H Build 56 | checklist only | **SUCCESS** `docs/store-release/BUILD_56_EXECUTION_PACKET.md` · no Archive/Upload/TestFlight |

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
