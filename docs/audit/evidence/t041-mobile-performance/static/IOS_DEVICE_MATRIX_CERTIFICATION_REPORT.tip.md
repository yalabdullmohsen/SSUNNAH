# T-040 — iOS Device Matrix Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-040 IOS_DEVICE_MATRIX_COMPLETION` |
| Date (UTC) | `2026-10-02` |
| Tip commit at run | `ef2d35a0e` (`origin/main` at checkout) · `version.json` MATCH via build-context |
| Evidence | `docs/audit/evidence/t040-ios-device-matrix/` |
| Exit | **`IOS_DEVICE_MATRIX_INCOMPLETE`** → **FAIL** |

### Prerequisite corrections (vs CURRENT STATE)

| Claim | Honest tip |
|-------|------------|
| Accessibility CERTIFIED | **FALSE** — T-039 `IOS_ACCESSIBILITY_NOT_CERTIFIED` |
| Device Evidence | **PARTIAL OR EMPTY** — confirmed; register cells remain `DEVICE_REQUIRED` |

SoT: `DEVICE_QA_REGISTER.md` · `WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md` (**RUNBOOK_READY**; execution still **DEVICE_REQUIRED**).

---

## 1. Device Inventory

| Required class | Physical ownership / filled rows | Status |
|----------------|----------------------------------|--------|
| Modern iPhone (D-IP14 class) | No Artifact+Tester+Date matrix | **FAIL_RECORD** |
| Older/Smaller iPhone (D-IPSE class) | None | **FAIL_RECORD** |
| iPad (D-IPAD) | None | **FAIL_RECORD** |
| iPad Split View | None (T-032 also failed Split View) | **FAIL_RECORD** |

Simulator list captured for inventory only (`static/simctl-available.txt`) — **does not** satisfy DEVICE_TESTED.

Build context: `static/build-context.json` (production MATCH at capture).

---

## 2. Device Results

| Device class | Cold/Warm/Resume/Offline/DeepLink/Notification/Rotation/LargeText/Dark/Light × surfaces | Result |
|--------------|----------------------------------------------------------------------------------------|--------|
| Modern iPhone | Required surfaces unfilled | **FAIL** |
| Older iPhone | Required surfaces unfilled | **FAIL** |
| iPad | Required surfaces unfilled | **FAIL** |
| Split View | Unfilled | **FAIL** |

No row claims `DEVICE_TESTED` (missing Artifact + Tester + Date).

---

## 3. Surface Coverage

| Surface | Coverage |
|---------|----------|
| Home · Search · Quran Hub · Mushaf · Prayer · Lessons · Hadith · Settings · Account | **INCOMPLETE** on all required devices |
| Mushaf special (turn/search/bookmarks/tafsir) | **DEVICE_REQUIRED** / unproven in register |
| Prayer special (countdown/next/notification open) | **DEVICE_REQUIRED** |
| Widgets / Watch | Prior native certs exist for some UI surfaces; **not** substituted for this matrix exit |

---

## 4. Failure Inventory

See `static/FAIL_RECORDS.json`:

| ID | Device class | Reason |
|----|--------------|--------|
| `FAIL_RECORD-D-IP-MODERN` | Modern iPhone | No complete surface×mode rows with artifacts |
| `FAIL_RECORD-D-IP-OLDER` | Older/Smaller iPhone | No evidence pack |
| `FAIL_RECORD-D-IPAD` | iPad | No evidence pack |
| `FAIL_RECORD-D-IPAD-SPLIT` | iPad Split View | Never evidenced |

Register excerpt: nearly all Home/Mushaf/Prayer/Search/Adhan cells = **DEVICE_REQUIRED**.

---

## 5. Artifact Links

| Artifact | Path |
|----------|------|
| FAIL records | `docs/audit/evidence/t040-ios-device-matrix/static/FAIL_RECORDS.json` |
| Build context | `docs/audit/evidence/t040-ios-device-matrix/static/build-context.json` |
| A11y tip | `docs/audit/evidence/t040-ios-device-matrix/static/IOS_ACCESSIBILITY_CERTIFICATION_REPORT.tip.md` |
| Sim inventory (non-cert) | `docs/audit/evidence/t040-ios-device-matrix/static/simctl-available.txt` |
| Matrix JSON | `docs/audit/evidence/t040-ios-device-matrix/matrix-results.json` |

No per-case screenshot/recording packs under `docs/audit/device-evidence/<date>-<sha>/` for T-040.

---

## 6. Final Matrix

```text
Modern iPhone PASS   → FAIL
Older iPhone PASS    → FAIL
iPad PASS            → FAIL
Split View PASS      → FAIL
```

`DEVICE_QA_REGISTER` status machine: **not complete**.

---

## 7. Exit Decision

```text
IOS_DEVICE_MATRIX_INCOMPLETE
T-040=FAIL
DEVICE_TESTED=false
A11Y_PREREQ=NOT_CERTIFIED
WAVE13_EXECUTION=DEVICE_REQUIRED
PERF_CERT=NOT_STARTED
BUTTON_AUTHORITY=NOT_STARTED
CARD_AUTHORITY=NOT_STARTED
BACK_AUTHORITY=NOT_STARTED
ROUTE_MATRIX=NOT_STARTED
TESTFLIGHT=NOT_STARTED
STORE_READINESS=NOT_STARTED
```

**Verdict: FAIL** — do not claim `IOS_DEVICE_MATRIX_COMPLETE`. Do not start Performance / Button·Card·Back Authority / Route Matrix / TestFlight / Store Readiness until Modern + Older iPhone + iPad + Split View rows exist with Artifact + Tester + Date per required surface×mode.
