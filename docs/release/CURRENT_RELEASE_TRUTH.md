# CURRENT RELEASE TRUTH — سُنّة

**Generated:** 2026-10-03  
**Program:** iOS physical certification preparation (no new Build / no Store action)  
**Authority:** Measured from `origin/main` + live production  
**Canonical status surface:** `docs/release/CURRENT_PROJECT_STATUS.md`  
**Boundary report:** `docs/audit/SUNNAH_FINAL_INTERNAL_AND_EXTERNAL_BOUNDARY_REPORT.md`  
**PR board:** EMPTY · `docs/audit/OPEN_PR_RESOLUTION_BOARD.md`  
**Physical cert program:** `docs/audit/physical-cert/PHYSICAL_CERTIFICATION_PROGRAM.md`

---

## Pins (verified this run)

| Surface | Value | Evidence |
|---|---|---|
| Git root | `git rev-parse --show-toplevel` | command |
| `origin/main` tip | `631dcc01ebff50f30eafbe5464f1777d96a1920f` | `git fetch` + rev-parse |
| Production `version.json` | `631dcc01` · HTTP 200 · `builtAt` `2026-10-03T16:15:34.866Z` | curl `https://www.ssunnah.com/version.json` |
| Match | **MATCH** | live vs origin/main |
| App Store (no action) | `1.0` LIVE / READY_FOR_SALE | `BUILD_55_TRACEABILITY.md` |
| ASC update under review | OWNER_DECLARED — agent must not touch | queue accepted truth |
| TestFlight (no action) | `1.0.1 (55)` available; device cert missing | same |
| Source pbx pin | still `1.0.1` / `55` (no bump this prep) | `project.pbxproj` |
| Next Archive requirement | build **≥ 56** from hardened main | `FUTURE_BUILD_56_CHECKLIST.md` |
| T-040 Device matrix | `IOS_DEVICE_MATRIX_INCOMPLETE` / DEVICE_CONNECTION_REQUIRED | physical-cert runbooks |
| T-033 Deep links | `IOS_DEEP_LINKS_NOT_CERTIFIED` / DEVICE_REQUIRED | runbook + AASA live |
| Widgets | T-028/029/031 on main; #2299 superseded | PrayerWidget + Live Activity |
| Offline Expo PR #1791 | OBSOLETE; manifest only | `OFFLINE_SCOPE_MANIFEST.md` |
| Open PR board | **EMPTY** | `gh pr list` |
| Evidence PR | **not created** (no physical pack yet) | policy |
| Internal status | **INTERNAL_CLOSURE_COMPLETE** + physical prep ready | program index |
| General status | **WEB_RELEASED_NATIVE_HOLD** | boundary + device hold |
| Store RC pin | **not set by owner** | HOLD |

**Smoke (public):** HTTP 200 on primary routes. `/admin*` anonymous → intentional 404.

---

## Status vocabulary (allowed)

| Status | Meaning |
|---|---|
| INTERNAL_CLOSURE_COMPLETE | FIXABLE_IN_REPOSITORY P0/P1 for this program closed or classified |
| VISUAL_INTERACTION_COMPLETE_WEB | Web visual/interaction authorities applied; device gaps remain |
| WEB_RELEASED_NATIVE_HOLD | Web released; native/store hold |
| DEVICE_REQUIRED | Needs real-device evidence (WAVE13 runbook) |
| OWNER_ACTION / BLOCKED_* | Outside pure repo fix |

## Explicit non-claims

`STORE GO` · `FULLY COMPLETE` · `ZERO_INTERNAL_DEBT` · `WCAG CERTIFIED` · `DEVICE_TESTED` · `MUSHAF_SILKY`
