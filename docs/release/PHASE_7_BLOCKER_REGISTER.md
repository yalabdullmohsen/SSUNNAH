# PHASE 7 — Blocker Register

| Field | Value |
|---|---|
| Generated | 2026-09-28 |
| Updated | 2026-09-28 post `#2331` |
| Authority | Phase 1–6 reports + live production `version.json` + GitHub/Vercel status |
| Store | **HOLD** |
| Rule | Documentation ≠ fix · CI green ≠ license/signing/device PASS · Simulator ≠ device |

Classifications: `FIXABLE_IN_REPOSITORY` · `TEST_REQUIRED` · `DEVICE_REQUIRED` · `OWNER_ACTION` · `EXTERNAL_ACTION` · `BLOCKED_LICENSE` · `BLOCKED_SOURCE` · `BLOCKED_CREDENTIAL` · `BLOCKED_ENVIRONMENT` · `PRE_EXISTING` · `ACCEPTED_RISK` · `RESOLVED` · `NOT_APPLICABLE` · `MISSING_EVIDENCE`

Critical/High may **not** use `ACCEPTED_RISK`.

---

## P7-020 — Vercel Production deploy failed for main tip `2478ebd7`

| Field | Value |
|---|---|
| Source | GitHub commit status `Vercel – majalis-majalis` + live `version.json` |
| Severity | Critical (web ship) |
| Platform | Web |
| Module | Official project `majalis-majalis` Auto Deploy on `main` |
| Evidence | `dpl_FMaX3KQwHGVdkdzEHy17FkfgbcEj` FAILURE · production still `dba87a60` · main CI SUCCESS |
| Classification | `BLOCKED_ENVIRONMENT` (+ `OWNER_ACTION` for log access without `VERCEL_TOKEN`) |
| Owner | Release eng + Vercel project owner |
| Required action | Read build logs · fix root cause if in repo · redeploy until `version.json` matches `2478ebd7` |
| Verification | `https://www.ssunnah.com/version.json` commit == `2478ebd7` |
| Release impact | Blocks declaring `WEB_RELEASED_NATIVE_HOLD` |
| Status | **OPEN** |

## P7-001 — Android applicationId ≠ Capacitor/iOS appId

| Field | Value |
|---|---|
| Source | P6 truth / release:verify warning |
| Severity | High (store identity) |
| Platform | Android |
| Module | `android/app/build.gradle` vs `capacitor.config.*` |
| Evidence | `com.majlisilm.app` vs `com.yousef.majlisilm` |
| Classification | `OWNER_ACTION` |
| Owner | Product owner + Play Console |
| Required action | Written dual-ID strategy or coordinated rename |
| Verification | Play listing + Gradle + Capacitor align OR documented exception |
| Release impact | Blocks store submission identity certainty |
| Status | **OPEN** |

## P7-002 — iOS / Android signing credentials absent

| Field | Value |
|---|---|
| Source | P6 checklists |
| Severity | Critical (package) |
| Platform | iOS + Android |
| Module | signing / keystore / profiles |
| Evidence | No certs in repo by design; Archive/AAB not runnable here |
| Classification | `BLOCKED_CREDENTIAL` |
| Owner | Owner |
| Required action | Provide signing material in secure CI/local owner env |
| Verification | Signed Archive / AAB succeeds |
| Release impact | No TestFlight / Play upload |
| Status | **OPEN** |

## P7-003 — QPC / QUL font redistribution for store binary

| Field | Value |
|---|---|
| Source | `RELEASE_ASSET_LICENSE_MATRIX` · LICENSE_RISKS |
| Severity | Critical (store binary) |
| Platform | Native store (+ web already uses fonts) |
| Module | QPC fonts |
| Evidence | Matrix: BLOCKED_LICENSE until written clearance |
| Classification | `BLOCKED_LICENSE` |
| Owner | Rights desk |
| Required action | Written redistribution clearance or strip from store flavor |
| Verification | Letter/URL in `docs/legal` + license gate |
| Release impact | STORE HOLD |
| Status | **OPEN** |

## P7-004 — Hisn Muslim edition permission

| Field | Value |
|---|---|
| Source | License matrix |
| Severity | High |
| Platform | All surfaces shipping Hisn |
| Module | Adhkar / Hisn content |
| Evidence | BLOCKED_LICENSE / OWNER_ACTION in matrix |
| Classification | `BLOCKED_LICENSE` |
| Owner | Rights desk |
| Required action | Permission or replacement edition |
| Verification | Documented permission path |
| Release impact | STORE HOLD |
| Status | **OPEN** |

## P7-005 — Adhan / CAF / offline audio bundling rights

| Field | Value |
|---|---|
| Source | License matrix · store strip policy |
| Severity | High |
| Platform | Native |
| Module | `public/sounds/adhan` · CAF |
| Evidence | DO_NOT_BUNDLE / unresolved packs |
| Classification | `BLOCKED_LICENSE` / `OWNER_ACTION` |
| Owner | Legal |
| Required action | Allowlist verified packs only |
| Verification | `verify:store-assets` + matrix update |
| Release impact | STORE HOLD for bundled audio |
| Status | **OPEN** |

## P7-006 — Mushaf real-device matrix empty

| Field | Value |
|---|---|
| Source | `MUSHAF_REAL_DEVICE_RELEASE_MATRIX.md` |
| Severity | Critical (native UX integrity) |
| Platform | iOS + Android devices |
| Module | `/mushaf` |
| Evidence | All device rows DEVICE_REQUIRED; no dated build-id artifacts |
| Classification | `DEVICE_REQUIRED` |
| Owner | QA / owner |
| Required action | Fill matrix with model/OS/build id/date/result |
| Verification | Matrix rows + evidence paths |
| Release impact | No READY_FOR_OWNER_GO |
| Status | **OPEN** |

## P7-007 — Prayer/Adhan real-device matrix empty

| Field | Value |
|---|---|
| Source | `PRAYER_ADHAN_REAL_DEVICE_MATRIX.md` |
| Severity | Critical (notification/audio) |
| Platform | iOS + Android |
| Module | Prayer / Adhan |
| Evidence | No terminated/background audio evidence |
| Classification | `DEVICE_REQUIRED` |
| Owner | QA / owner |
| Required action | Background + terminated + interrupt cases |
| Verification | Dated matrix tied to RC build id |
| Release impact | STORE HOLD |
| Status | **OPEN** |

## P7-008 — ASC / Play metadata & privacy nutrition

| Field | Value |
|---|---|
| Source | Store metadata gap report |
| Severity | High |
| Platform | Store consoles |
| Module | Metadata |
| Evidence | Not uploaded; OWNER_ACTION |
| Classification | `OWNER_ACTION` / `EXTERNAL_ACTION` |
| Owner | Owner |
| Required action | Complete ASC/Play forms + screenshots |
| Verification | Console completeness |
| Release impact | Cannot submit |
| Status | **OPEN** |

## P7-009 — Supabase MFA / leaked-password / hosted auth hardening

| Field | Value |
|---|---|
| Source | Privacy gap · P6 owner actions |
| Severity | High |
| Platform | Hosted Auth |
| Module | Supabase |
| Evidence | Dashboard toggles not proven from repo |
| Classification | `OWNER_ACTION` / `BLOCKED_ENVIRONMENT` |
| Owner | Owner |
| Required action | Enable + screenshot evidence |
| Verification | Dashboard export / policy note |
| Release impact | Elevated auth risk for public rollout |
| Status | **OPEN** |

## P7-010 — Production secrets confirmation (Vercel / push / VAPID)

| Field | Value |
|---|---|
| Source | P6 owner actions |
| Severity | High |
| Platform | Web + push |
| Module | Env |
| Evidence | Values must not appear in repo; presence unproven here |
| Classification | `OWNER_ACTION` / `BLOCKED_CREDENTIAL` |
| Owner | Owner |
| Required action | Signed checklist that required secrets exist in prod |
| Verification | Non-destructive ready checks / owner attestation |
| Release impact | Blocks confident WEB deploy attestation |
| Status | **OPEN** |

## P7-011 — Universal Links / assetlinks live proof

| Field | Value |
|---|---|
| Source | P6 owner actions |
| Severity | Medium |
| Platform | iOS + Android |
| Module | Associated domains |
| Evidence | Not re-proven in Phase 7 |
| Classification | `OWNER_ACTION` / `EXTERNAL_ACTION` |
| Owner | Owner |
| Required action | curl AASA + assetlinks on production hosts |
| Verification | HTTP 200 + correct app ids |
| Release impact | Deep link failures risk |
| Status | **OPEN** |

## P7-012 — Account deletion / export hosted E2E

| Field | Value |
|---|---|
| Source | Privacy gap |
| Severity | High (rights) |
| Platform | Web/hosted |
| Module | Account |
| Evidence | Routes/UI PARTIAL; hosted verify OWNER_ACTION |
| Classification | `OWNER_ACTION` / `TEST_REQUIRED` |
| Owner | Owner + QA |
| Required action | Test-env deletion/export proof (not prod mutation) |
| Verification | Test project runbook result |
| Release impact | Privacy compliance gap |
| Status | **OPEN** |

## P7-013 — Library books without provenance URL

| Field | Value |
|---|---|
| Source | Content quality reports (pre-existing) |
| Severity | Medium |
| Platform | Content |
| Module | Library |
| Evidence | BLOCKED_SOURCE · hidden from inventing URLs |
| Classification | `BLOCKED_SOURCE` / `PRE_EXISTING` |
| Owner | Content |
| Required action | Source URLs or keep excluded |
| Verification | Content gates |
| Release impact | Incomplete library; not invented |
| Status | **OPEN** |

## P7-014 — Madinah page images not in repo

| Field | Value |
|---|---|
| Source | License matrix |
| Severity | Medium |
| Platform | Mushaf visual |
| Module | Page images |
| Evidence | DO_NOT_BUNDLE / BLOCKED_SOURCE |
| Classification | `BLOCKED_SOURCE` |
| Owner | Rights |
| Required action | Approved source or keep out of binary |
| Verification | Matrix |
| Release impact | Store/binary packaging constraint |
| Status | **OPEN** |

## P7-015 — Remote push credentials (APNs/FCM)

| Field | Value |
|---|---|
| Source | P6 truth |
| Severity | Medium |
| Platform | Native |
| Module | Push |
| Evidence | OWNER_ACTION |
| Classification | `OWNER_ACTION` / `BLOCKED_CREDENTIAL` |
| Owner | Owner |
| Required action | Configure push in owner env |
| Verification | Test push to owner device only |
| Release impact | Remote push unavailable |
| Status | **OPEN** |

## P7-016 — mushaf-madinah.css still on live `/mushaf` path

| Field | Value |
|---|---|
| Source | P1 implementation BLOCKED |
| Severity | Low/Medium (perf/maintainability) |
| Platform | Web |
| Module | Mushaf CSS |
| Evidence | Live DOM still uses `mm-*`; full extract blocked |
| Classification | `PRE_EXISTING` (not Critical; follow-up) |
| Owner | Engineering follow-up |
| Required action | Extract shell CSS then drop archived weight |
| Verification | Bundle + visual gates |
| Release impact | Does not alone HOLD store if other gates pass |
| Status | **OPEN** (non-blocking for TECHNICALLY_VERIFIED) |

## P7-017 — Stale CURRENT_PROJECT_STATUS vs live production

| Field | Value |
|---|---|
| Source | Phase 7 discovery |
| Severity | Medium (truth conflict) |
| Platform | Docs |
| Module | `docs/release/CURRENT_PROJECT_STATUS.md` |
| Evidence | Doc cited old tip; live `version.json` = `2e008c8d` |
| Classification | `FIXABLE_IN_REPOSITORY` |
| Owner | Phase 7 agent |
| Required action | Rewrite status from measured facts |
| Verification | Doc matches `origin/main` + live version.json |
| Release impact | Misleading release truth |
| Status | **RESOLVED in Phase 7** (doc update) |

## P7-018 — Stale release-verify-report commit (P5 hash on P6 tip)

| Field | Value |
|---|---|
| Source | Phase 7 discovery |
| Severity | Medium |
| Platform | Reports |
| Module | `reports/release-candidate/release-verify-report.json` |
| Evidence | `commit` field was `7716977d7` while tip `c935dab07` |
| Classification | `FIXABLE_IN_REPOSITORY` |
| Owner | Phase 7 agent |
| Required action | Re-run `pnpm run release:verify` + RC build on integration tip |
| Verification | Report commit == `git rev-parse HEAD` |
| Release impact | Unreproducible RC attestation |
| Status | **RESOLVED** — `release:verify` regenerated at `dd1cb859` (`reports/release-candidate/release-verify-report.json`) |

## P7-019 — Dedicated Phase 1–5 FINAL reports missing

| Field | Value |
|---|---|
| Source | Preconditions |
| Severity | Low (process) |
| Platform | Docs |
| Module | `docs/remediation` |
| Evidence | Baselines present; named FINAL reports absent |
| Classification | `MISSING_EVIDENCE` |
| Owner | Process |
| Required action | Optional backfill; do not invent PASS |
| Verification | Baselines + commits used as substitute |
| Release impact | Does not block repo work; cited in baseline |
| Status | **OPEN** (non-blocking) |

## P7-020 — Hosted SQL / RLS migrations for this RC

| Field | Value |
|---|---|
| Source | Phase 7 scan of P2–P6 commits for `*.sql` / supabase |
| Severity | — |
| Platform | Database |
| Evidence | No SQL migration files in P1–P6 remediation tips requiring apply |
| Classification | `NOT_APPLICABLE` for this RC delta |
| Owner | — |
| Required action | None for this integration delta |
| Verification | `git log` path filter empty for new SQL |
| Release impact | None for this RC |
| Status | **RESOLVED** (N/A) |

---

## Summary counts (open)

| Class | Count (open) |
|---|---:|
| FIXABLE_IN_REPOSITORY remaining after Phase 7 docs/RC | 0 (target) |
| DEVICE_REQUIRED | 2+ (matrices) |
| OWNER_ACTION | 8+ |
| EXTERNAL_ACTION | 2+ |
| BLOCKED_LICENSE | 3+ |
| BLOCKED_SOURCE | 2+ |
| BLOCKED_CREDENTIAL | 2+ |
| BLOCKED_ENVIRONMENT | 1+ |
| MISSING_EVIDENCE (process) | 1 |

**STORE STATUS remains HOLD.** No STORE GO.
