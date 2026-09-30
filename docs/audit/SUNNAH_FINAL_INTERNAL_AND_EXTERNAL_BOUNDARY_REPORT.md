# سُنّة — Final Internal and External Boundary Report

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Tip | Feature tip `aa94c759` (WAVE13) · this docs PR syncs status; MATCH re-verified after merge |
| Host | `https://www.ssunnah.com` |
| Internal status | **INTERNAL_CLOSURE_COMPLETE** |
| Web visual/interaction | **VISUAL_INTERACTION_COMPLETE_WEB** |
| General status | **WEB_RELEASED_NATIVE_HOLD** |
| Store | **HOLD** (not STORE GO) |

## EXECUTIVE VERDICT

The post-WAVE6 internal closure program (WAVE7→WAVE13) is delivered, merged, and deployed. Production matches `main` at `b8fc9dbf`. Public smoke routes return HTTP 200. Remaining gaps are honestly classified as DEVICE_REQUIRED, OWNER_ACTION, BLOCKED_*, KEEP_JUSTIFIED, or MUSHAF/PRAYER/ADMIN special — not undeclared FIXABLE_IN_REPOSITORY P0/P1.

This report does **not** claim STORE GO, FULLY COMPLETE, ZERO_INTERNAL_DEBT, WCAG CERTIFIED, DEVICE_TESTED, or MUSHAF_SILKY.

## MAIN AND PRODUCTION

| Surface | Value | Evidence |
|---|---|---|
| `origin/main` | `aa94c75975d87a99c8aa02bbde44ba90a131c079` (pre-FINAL-docs) · advances on merge | `gh api …/commits/main` |
| Production `version.json` | `aa94c759` · `builtAt` `2026-09-30T14:17:06.261Z` (pre-FINAL-docs) | live curl |
| Match | **MATCH** | `scripts/device-evidence/capture-build-context.mjs` |
| Public smoke | `/` `/search` `/quran-hub` `/mushaf` `/prayer-times` `/lessons` `/hadith` `/fiqh` `/adhkar` `/settings` `/my-learning` `/login` `/register` `/api/healthz` `/version.json` → **200** | curl |
| `/admin/v3` | HTTP **404** “غير متاح” for anonymous public | intentional edge isolation (ADMIN_ACCESS) |

## WAVE7 TO WAVE13 DELIVERY MATRIX

| Wave | PR | Merge SHA | Title | Deploy MATCH |
|---|---|---|---|---|
| 7 | #2385 | `ae78fe56` | identity cascade absorption | yes |
| 8 | #2386 | `77ae6759` | card/surface raw values | yes |
| 9 | #2387 | `7304cbeb` | admin interaction/forms | yes |
| 10 | #2388 | `2aa5dc8a` | mushaf control semantics | yes |
| 11 | #2389 | `12fba46c` | route quality expansion | yes |
| 12 | #2390 | `e29f2cb0` | index.css decomposition | yes |
| 13 | #2391 | `aa94c759` | device evidence runbooks | yes |

## BEFORE VS AFTER

Live tip inventory `2026-09-30T14:18:02Z` vs post-WAVE10/11 ceilings carried into WAVE12:

| Metric | Pre-WAVE12 ceiling | Final measured | Δ | Notes |
|---|---:|---:|---:|---|
| cssFiles | 356 | 356 | 0 | no new aggregator files |
| important | 4787 | 4787 | 0 | no new `!important` |
| hexInCss | 8978 | **8931** | −47 | WAVE12 dead removal + token fallback absorption |
| rgbHslInCss | 2129 | **2125** | −4 | improved |
| borderRadiusPxDecls | 1270 | **1265** | −5 | improved |
| buttonRelatedHexApprox | 1723 | **1709** | −14 | improved |
| mjDeclOutsideAllowlist | 0 | **0** | 0 | held |
| rawButtonFiles | 183 | 183 | 0 | held |
| officialButtonImportFiles | ≥186 | 186 | floor held | |
| index.css lines | 4308 | **3977** | −331 | WAVE12 |
| main sync CSS imports | 22 | 22 | 0 | held |
| main deferred CSS imports | 51 | 51 | 0 | held |

## IDENTITY CASCADE

WAVE7 absorbed competing reload-to-win paths into Foundation / Theme Aliases authority. Compatibility layers remain classified (ACTIVE_COMPATIBILITY / SAFE_REMOVE_CANDIDATE) — not deleted wholesale without consumer=0 proof. Report: `docs/design/WAVE7_IDENTITY_CASCADE_ABSORPTION_REPORT.md`.

## COLORS AND TOKENS

No new token family. Hex/rgb ceilings decreased. Remaining hex is KEEP_JUSTIFIED / legacy compatibility / Mushaf/prayer special — tracked by debt budgets (decreasing-ceilings policy).

## LIGHT DARK SYSTEM

Authority docs + gates held through waves. Device confirmation of System theme smoothness remains DEVICE_REQUIRED.

## CARDS AND SURFACES

WAVE8 absorbed raw surface values into Card Surface Authority / AppCard family. Report: `docs/design/WAVE8_CARD_SURFACE_VALUE_ABSORPTION_REPORT.md`.

## SHADOW RADIUS Z-INDEX

Raw radii down; z-index raw decls unchanged at 258 (no raise). Further absorption = follow-up KEEP, not P0.

## BUTTONS AND INTERACTIONS

Interaction authority floors held. WAVE9/10 closed Admin + Mushaf semantic debt within allowlists. `divSpanOnClick` 59 remains justified/admin/legacy classified via gates.

## ADMIN

WAVE9 closed interaction/form authority debt. Public `/admin*` returns edge 404 (no secrets). Admin CSS remains out of initial public graph policy. Report: `docs/admin/WAVE9_ADMIN_INTERACTION_CLOSURE_REPORT.md`.

## MUSHAF CONTROLS

WAVE10 semantic cleanup only — WAVE6 state machine not reopened. Report: `docs/mushaf/WAVE10_MUSHAF_CONTROL_SEMANTIC_CLOSURE_REPORT.md`.

## MUSHAF FLUIDITY

WAVE6 performance contract preserved (mushaf gates PASS in verify:ci). Silky real-device FPS remains DEVICE_REQUIRED.

## ROUTE QUALITY

WAVE11 expanded verified public coverage with honest routeClass + test refs. Incomplete device fields stay DEVICE_REQUIRED. Report: `docs/audit/WAVE11_ROUTE_QUALITY_EXPANSION_REPORT.md`.

## INDEX CSS

WAVE12 reduced `index.css` 4308→3977; DEAD_PROVEN removed; live rules moved to existing owners only. Report: `docs/design/WAVE12_INDEX_GLOBAL_CSS_DECOMPOSITION_REPORT.md`. Residual global rules = KEEP / later batches.

## STARTUP AND FOUC

Code mitigations + WAVE5/7 gates held. Physical CLS/FOUC on devices = DEVICE_REQUIRED.

## CRITICAL CSS

`mjDeclOutsideAllowlist=0`; gzip gate covered in verify/CI path; budget policy unchanged (no raise).

## ACCESSIBILITY

Contrast / on-brand / semantic gates exercised across waves. VoiceOver/TalkBack/WCAG Certified = **not claimed** (DEVICE_REQUIRED).

## PERFORMANCE

LHCI subject to Class C TBT flake (≤2100); one `rerun --failed` used on WAVE12. Bundle budgets held in verify:ci.

## TESTS AND GATES

Local per-wave: `verify:preflight` + `verify:ci` PASS. Required CI green before merge (no red merges). WAVE13 gate forbids inventing device PASS.

## PRODUCTION SMOKE TESTS

Public routes HTTP 200 after WAVE13 deploy. Admin anonymous 404 expected. No destructive Admin actions run.

## ROLLBACK EVENTS

None required in WAVE7→13.

## REMAINING FIXABLE_IN_REPOSITORY

No open **P0/P1** FIXABLE_IN_REPOSITORY items from this program’s scope after WAVE7–13. Residual CSS/design debt is classified SAFE_REMOVE_CANDIDATE / KEEP_JUSTIFIED / follow-up batches (not undeclared P0).

## KEEP_JUSTIFIED

- Compatibility CSS layers still imported (parity/contrast).
- Remaining `index.css` shell/home/nav rules.
- `divSpanOnClick` allowlisted cases.
- Admin public edge 404 page.

## MUSHAF_SPECIAL

- Immersive reader CSS/geometry contracts.
- WAVE6 turn machine + fluidity measurements.
- Device FPS/100-turn matrices.

## PRAYER_SPECIAL

- Prayer route shell / theme isolation.
- Adhan scheduling & background delivery (device + license).

## DEVICE_REQUIRED

All rows in `docs/audit/WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md` and `DEVICE_QA_REGISTER.md` until owner artifacts exist.

## OWNER_ACTION

Store RC pin, certificates, account/email confirmation flows, production secrets/SQL — unchanged ownership.

## LICENSE_BLOCKERS

Adhan/audio rights where applicable — BLOCKED_LICENSE until cleared.

## STORE STATUS

**HOLD** · **WEB_RELEASED_NATIVE_HOLD** · not STORE GO.

## FINAL STATUS

| Axis | Status |
|---|---|
| Internal closure | **INTERNAL_CLOSURE_COMPLETE** |
| Visual/Interaction web | **VISUAL_INTERACTION_COMPLETE_WEB** |
| General | **WEB_RELEASED_NATIVE_HOLD** |
| Store | HOLD |
| Device | DEVICE_REQUIRED |
