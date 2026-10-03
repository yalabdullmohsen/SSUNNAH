# DEVICE_REQUIRED Checklist — current

**Status:** `DEVICE_CONNECTION_REQUIRED` + `DEVICE_REQUIRED`  
**Program:** `docs/audit/physical-cert/PHYSICAL_CERTIFICATION_PROGRAM.md`  
**App / build target for tip-aligned cert:** marketing `≥ 1.0.1` · build **`≥ 56`**  
**Baseline smoke only:** TestFlight `1.0.1 (55)` or current App Store / review binary (declare exact Build)  
**Do not** mark `DEVICE_TESTED` or `DEEP_LINKS_CERTIFIED` from Simulator alone.

## Live pins (prep)

```text
origin/main            631dcc01e
production version.json 631dcc01 MATCH
App Store               1.0 LIVE
ASC update under review OWNER_DECLARED — do not touch
TestFlight              1.0.1 (55)
pbx source pin          still 55 (no Build bump in prep task)
Open PR board           EMPTY
```

## Connected devices

See `docs/audit/physical-cert/DEVICE_INVENTORY_CURRENT.md`  
Physical devices observed offline (iPhone 17 Pro, iPhone 13); **no iPad**; none available this session.

## T-040 — Device matrix

Fill via `T040_DEVICE_MATRIX_RUNBOOK.md` + physical pack rows.

| Device | iOS | App version/build | Tester | Date | Result | Artifact |
|--------|-----|-------------------|--------|------|--------|----------|
| iPhone primary | | | | | PENDING | |
| iPhone secondary | | | | | PENDING | |
| iPad | | | | | PENDING | |
| iPad Split View | | | | | PENDING | |

Surfaces: Home · Search · Quran Hub · Mushaf · Prayer · Lessons · Account · Settings

## T-033 — Deep links

Runbook: `T033_DEEP_LINK_RUNBOOK.md` (URLs derived from AASA + `majlisilm://` only)

| State | URL | Expected Cap route | Build | Result | Artifact |
|-------|-----|--------------------|-------|--------|----------|
| Terminated | https://www.ssunnah.com/prayer-times | Prayer | | PENDING | |
| Background | https://www.ssunnah.com/mushaf | Mushaf | | PENDING | |
| Foreground | majlisilm://search | Search | | PENDING | |
| Auth callback | product-supported only (not AASA /auth/*) | restore | ≥56 | PENDING | |

## Auth / Widget / Mushaf / Push / A11y / Perf

See suite runbooks under `docs/audit/physical-cert/`.  
AUTH suite = `REQUIRES_FUTURE_BUILD_GE_56` only.

## Ingestion

```bash
node scripts/device-evidence/validate-physical-evidence-pack.mjs \
  --pack docs/audit/device-evidence/<YYYYMMDD>-<build>-<shortSha>
```

No Evidence PR until ≥1 real physical row + artifact exists.
