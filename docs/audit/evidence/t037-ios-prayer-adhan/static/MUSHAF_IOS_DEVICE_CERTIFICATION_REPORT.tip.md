# T-036 — Mushaf iOS Device Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-036 MUSHAF_IOS_DEVICE_CERTIFICATION` |
| Date (UTC) | `2026-10-02` |
| Tip commit at run | `d8af76642` (`origin/main`) |
| Evidence | `docs/audit/evidence/t036-mushaf-ios/` |
| Exit | **`MUSHAF_IOS_NOT_CERTIFIED`** → **FAIL** |

Sacred boundary: **NO EDITS** to Quran text, tashkeel, ayah numbering, 604 pages, page/ayah/audio mapping, QPC association, or flip direction.

### Prerequisite / SoT gaps

| Doc | Status |
|-----|--------|
| `docs/mushaf/MUSHAF_HEAVINESS_AND_PAGE_TURN_REPORT.md` | **MISSING** in repo (referenced by MASTER_COPYABLE; not found on `origin/main` or history search) |
| Closest measured SoT used | `docs/mushaf/MUSHAF_FLUIDITY_OPTIMIZATION_REPORT.md` + `reports/mushaf-fluidity-*.json` |
| Offline cert | T-035 tip **`IOS_OFFLINE_NOT_READY_WITH_LICENSE_BOUNDARY`** (FAIL) — not on `main` at run |

