# CURRENT RELEASE TRUTH — سُنّة

**Generated:** 2026-09-30  
**Program:** Post-WAVE6 final internal closure (WAVE7→13)  
**Authority:** Measured from `origin/main` + live production  
**Canonical status surface:** `docs/release/CURRENT_PROJECT_STATUS.md`  
**Boundary report:** `docs/audit/SUNNAH_FINAL_INTERNAL_AND_EXTERNAL_BOUNDARY_REPORT.md`

---

## Pins (verified this run)

| Surface | Value | Evidence |
|---|---|---|
| Git root | `git rev-parse --show-toplevel` | command |
| `origin/main` tip | `ba139bb1ec753f2b6731e1018887e89897575988` | `gh api …/commits/main` |
| Production `version.json` | `ba139bb1` · HTTP 200 · `builtAt` `2026-09-30T14:58:51.872Z` | curl live |
| Match | **MATCH** | capture-build-context |
| Internal status | **INTERNAL_CLOSURE_COMPLETE** | boundary report |
| General status | **WEB_RELEASED_NATIVE_HOLD** | boundary report |
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
