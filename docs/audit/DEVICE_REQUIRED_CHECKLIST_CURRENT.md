# DEVICE_REQUIRED Checklist — current (post open-PR sync)

**Status:** `DEVICE_REQUIRED` — no physical-device PASS claimed  
**App / build target for next evidence:** marketing `≥ 1.0.1` · build **`≥ 56`** (Build 55 lacks post-hardening auth; see `BUILD_55_TRACEABILITY.md`)  
**Do not** mark `DEVICE_TESTED` or `DEEP_LINKS_CERTIFIED` from Simulator alone.

## T-040 — Device matrix (from #2460 evidence on main)

Fill one row per device with Artifact + Tester + Date + Result.

| Device | iOS version | App version/build | Tester | Date | Result | Artifact path |
|--------|-------------|-------------------|--------|------|--------|---------------|
| iPhone primary (modern) | | | | | PENDING | `docs/audit/device-evidence/<date>-<sha>/` |
| iPhone secondary (older/smaller) | | | | | PENDING | |
| iPad | | | | | PENDING | |
| iPad Split View | | | | | PENDING | |

### Required surfaces × each device

Home · Search · Quran Hub · Mushaf · Prayer · Lessons · Account · Settings  
(+ Hadith if in register). Modes: Cold / Warm / Resume / Offline / DeepLink / Notification / Rotation / Large Text / Dark / Light as required by `DEVICE_QA_REGISTER.md` and `WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md`.

Historical FAIL pack (honest, incomplete): `docs/audit/evidence/t040-ios-device-matrix/`.

## T-033 — Deep links (from #2456 evidence on main)

| Check | Repository | Physical device |
|-------|------------|-----------------|
| AASA live + content-type | REPOSITORY_VALIDATED (sim pack) | Re-verify on device network |
| Associated Domains / Bundle ID | REPOSITORY_VALIDATED | Confirm on signed build ≥56 |
| Resolver / scheme unit tests | REPOSITORY_VALIDATED | — |
| Cold start UL → Cap route | NOT CERTIFIED | **DEVICE_REQUIRED** |
| Foreground / Background / Terminated | NOT CERTIFIED (sim FAIL) | **DEVICE_REQUIRED** |
| Auth callback + return target | UNPROVEN | **DEVICE_REQUIRED** |
| Query/hash preservation | repo tests only if present | **DEVICE_REQUIRED** |
| Unsupported host / unsafe scheme reject | repo tests preferred | spot-check on device |

Runbook script: `scripts/ios-deep-links-certification-matrix.sh`  
Sim evidence (FAIL / NOT CERTIFIED): `docs/audit/evidence/t033-ios-deep-links/`  
Report: `docs/audit/IOS_DEEP_LINKS_CERTIFICATION_REPORT.md`

### Physical UL / scheme matrix (empty until filled)

| State | URL | Expected Cap route | Tester | Date | Result | Screenshot/video |
|-------|-----|--------------------|--------|------|--------|------------------|
| Terminated | `https://www.ssunnah.com/prayer-times` | Prayer | | | PENDING | |
| Background | `https://www.ssunnah.com/mushaf` | Mushaf | | | PENDING | |
| Foreground | `majlisilm://search` | Search | | | PENDING | |
| Auth callback | (real product callback only) | restore target | | | PENDING | |

Do **not** invent domains/paths — use live AASA components and registered `majlisilm://` only.

## Exit condition for flipping FAIL → PASS

Artifact + Tester + Date on required board cells; honesty gates updated only after evidence exists; no Store upload required to document DEVICE_REQUIRED.
