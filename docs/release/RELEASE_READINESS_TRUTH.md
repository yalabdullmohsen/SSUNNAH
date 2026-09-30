# RELEASE READINESS TRUTH — سُنّة (Phase 7 / final remediation)

| Field | Value |
|---|---|
| Generated | 2026-09-30 (tip sync after WAVE13) |
| Branch | `main` @ `b8fc9dbf` (#2391) |
| Production tip | `b8fc9dbf` — matches `origin/main` |
| Authority | Measured gates + live GitHub/Vercel status — not marketing claims |
| **STORE STATUS** | **HOLD** |
| Final decision | **`WEB_RELEASED_NATIVE_HOLD`** |
| Internal | **`INTERNAL_CLOSURE_COMPLETE`** (see boundary report) |
| Web deployment | **PASS** — Vercel Production SUCCESS; live `version.json` = `b8fc9dbf` |
| Boundary report | `docs/audit/SUNNAH_FINAL_INTERNAL_AND_EXTERNAL_BOUNDARY_REPORT.md` |
| Historical Phase-7 merges | #2329–#2334 (superseded tip; kept for ancestry) |

STORE STATUS: HOLD

Allowed statuses only: `PASS` · `FAIL` · `PARTIAL` · `NOT_RUN` · `DEVICE_REQUIRED` · `OWNER_ACTION` · `EXTERNAL_ACTION` · `BLOCKED_LICENSE` · `BLOCKED_SOURCE` · `BLOCKED_CREDENTIAL` · `BLOCKED_ENVIRONMENT` · `PRE_EXISTING` · `NOT_APPLICABLE`

**Forbidden claims (must not be declared as achieved):** STORE GO · full remediation complete · WCAG certification · “real device tested” without DEVICE_REQUIRED closure · `SUNNAH_FULL_REMEDIATION_COMPLETE`.

## Canonical Phase 7 docs

- `docs/release/PHASE_7_INTEGRATION_BASELINE.md`
- `docs/release/PHASE_7_BLOCKER_REGISTER.md`
- `docs/release/PHASE_7_ENVIRONMENT_CHANGESET.md`
- `docs/operations/PHASE_7_RELEASE_MONITORING_PLAN.md`
- `docs/release/PHASE_7_FINAL_REPORT.md` (after final verify)
- `docs/legal/RELEASE_ASSET_LICENSE_MATRIX.md`
- `docs/release/RELEASE_ROLLOUT_AND_ROLLBACK.md`

## Surface matrix

| Surface | Status | Evidence / note |
|---|---|---|
| web build | PASS when `verify:ci` / `release:verify` green | |
| iOS build readiness (repo) | PARTIAL | Static gates PASS; Archive/signing = OWNER_ACTION / BLOCKED_CREDENTIAL |
| Android build readiness (repo) | PARTIAL | Gradle/IDs present; signing = BLOCKED_CREDENTIAL; appId ≠ Capacitor |
| startup | PASS | Phase 1 gates in CI |
| routing | PASS | route registry + AppRoutes |
| Mushaf (automated) | PASS | mushaf unit + measure gates in verify:ci |
| Mushaf (real device) | DEVICE_REQUIRED | `docs/qa/MUSHAF_REAL_DEVICE_RELEASE_MATRIX.md` |
| Quran persistence / bookmarks | PASS | automated; device = DEVICE_REQUIRED |
| prayer times (calc/schedule unit) | PASS | `test:prayer-engine-p0` |
| Adhan (real delivery/audio) | DEVICE_REQUIRED | `docs/qa/PRAYER_ADHAN_REAL_DEVICE_MATRIX.md` |
| local notifications | PARTIAL | unit/idempotency PASS; device delivery DEVICE_REQUIRED |
| remote push | OWNER_ACTION | credentials / APNs / FCM |
| authentication | PASS | CI gates; hosted MFA = OWNER_ACTION |
| account deletion / export | PARTIAL | routes + UI; hosted verification OWNER_ACTION |
| Admin v3 | PASS | Phase 3 gates |
| API security | PASS | Phase 2 gates |
| content validation | PASS | content gates in CI |
| search | PASS | Phase 4 |
| offline | PARTIAL | cache policy P4; device offline DEVICE_REQUIRED |
| accessibility | PARTIAL | automated contrast/a11y gates; SR DEVICE_REQUIRED |
| privacy implementation | PARTIAL | gap report; legal copy OWNER_ACTION |
| licenses (bundled binary) | BLOCKED_LICENSE / OWNER_ACTION | QPC / Hisn / adhan packs — see license matrix |
| signing | BLOCKED_CREDENTIAL | no certs in repo by design |
| store metadata | PARTIAL | technical gap report; ASC/Play EXTERNAL_ACTION |
| screenshots | OWNER_ACTION | store assets review |
| TestFlight | OWNER_ACTION | |
| Play internal testing | OWNER_ACTION | |
| rollback plan | PASS | documented, not executed |
| monitoring / incident | PARTIAL | contract + Phase 7 monitoring plan; external on-call NOT_APPLICABLE unless configured |
| Capacitor appId | PASS | `com.yousef.majlisilm` (do not change) |
| Android applicationId | OWNER_ACTION | `com.majlisilm.app` ≠ Capacitor/iOS — reconcile before store |
| production localhost | PASS | absent in capacitor configs |
| DEV gallery in prod nav | PASS | `import.meta.env.DEV` gated |
| production web commit | PASS (measured) | live `version.json` = `ed0cbd38` (= `origin/main` #2334) |

## Identity pins (do not mutate without owner)

| Key | Value |
|---|---|
| Capacitor `appId` | `com.yousef.majlisilm` |
| iOS `PRODUCT_BUNDLE_IDENTIFIER` | `com.yousef.majlisilm` |
| Android `applicationId` | `com.majlisilm.app` |
| Production server URL | `https://www.ssunnah.com` |
| App version (package) | `1.0.0` |
| Android `versionCode` | `1` |

## Critical HOLD reasons (native / store only)

1. BLOCKED_LICENSE / UNKNOWN assets for store binary (QPC fonts, Hisn, adhan packs, offline audio).  
2. DEVICE_REQUIRED: Mushaf + Prayer/Adhan real-device matrices incomplete.  
3. OWNER_ACTION: signing, ASC/Play, Supabase MFA, secrets attestation, appId Android reconcile.  
4. BLOCKED_CREDENTIAL: no production signing material in environment.  

Web Production tip mismatch (**RESOLVED** via #2333 — see `VERCEL_DEPLOYMENT_ROOT_CAUSE.md`).

## Update rule

Regenerate this table from `reports/release-candidate/release-verify-report.json` after each `pnpm run release:verify`. Never flip DEVICE_REQUIRED / OWNER_ACTION / BLOCKED_* to PASS from repository simulation alone.
