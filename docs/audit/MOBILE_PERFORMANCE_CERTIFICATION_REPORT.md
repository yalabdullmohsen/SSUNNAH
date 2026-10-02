# T-041 — Mobile Performance Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-041 MOBILE_PERFORMANCE_CERTIFICATION` |
| Date (UTC) | `2026-10-02` |
| Tip commit at run | `9e4978137` (`origin/main` = T-039) |
| Evidence | `docs/audit/evidence/t041-mobile-performance/` |
| Exit | **`MOBILE_PERFORMANCE_NOT_CERTIFIED`** → **FAIL** |

### Prerequisite corrections (vs CURRENT STATE)

| Claim | Honest tip |
|-------|------------|
| Device Matrix COMPLETE | **FALSE** — T-040 `IOS_DEVICE_MATRIX_INCOMPLETE` |
| Accessibility CERTIFIED | **FALSE** — T-039 `IOS_ACCESSIBILITY_NOT_CERTIFIED` |

Measurement rule: no FAST/SMOOTH/OPTIMIZED claims. Mushaf architecture: **NO EDITS**. Budgets: **not raised**.

`docs/mushaf/MUSHAF_HEAVINESS_AND_PAGE_TURN_REPORT.md`: **MISSING** in repo.

---

## 1. Test Devices

| Device | OS | Build | Perf table |
|--------|----|-------|------------|
| Modern iPhone | — | — | **EMPTY** (no Device/OS/Build/Metric/Result rows) |
| Older iPhone | — | — | **EMPTY** |
| iPad | — | — | **EMPTY** |

Simulator / web LHCI / fluidity model JSON ≠ Cap device certification.

---

## 2. Startup Metrics

| Metric | Result |
|--------|--------|
| Cold Start (ms) | **NOT MEASURED** on required devices |
| Warm Start (ms) | **NOT MEASURED** |
| Resume Time (ms) | **NOT MEASURED** |

**Board: Startup FAIL**

---

## 3. Navigation Metrics

| Metric | Result |
|--------|--------|
| Route Navigation Time | **NOT MEASURED** (Home/Search/Quran/Mushaf/Prayer/Lessons/Hadith/Settings) |
| Search Response | **NOT MEASURED** (device) |
| Navigation stalls / freezes | **UNPROVEN** |

**Board: Navigation FAIL**

---

## 4. Mushaf Metrics

| Metric | Result |
|--------|--------|
| Page turn latency | **NOT MEASURED** |
| FPS during reading | **NOT MEASURED** |
| Memory footprint (turns) | **NOT MEASURED** |
| Search latency (device) | **NOT MEASURED** |
| Repo fluidity model hotspots | BEFORE 64 → AFTER 0 (`fluidity-model-summary.json`) — **not** device wall-clock |

**Board: Mushaf FAIL**

---

## 5. Prayer Metrics

| Metric | Result |
|--------|--------|
| Countdown stability | **NOT MEASURED** |
| Next prayer stability | **NOT MEASURED** |
| Live Activity impact | **NOT MEASURED** (T-031 UI cert ≠ perf impact numbers) |

**Board: Prayer FAIL**

---

## 6. Memory Metrics

| Metric | Result |
|--------|--------|
| Memory usage by surface | **NOT MEASURED** |
| Memory spikes | **NOT MEASURED** |

---

## 7. CPU Metrics

| Metric | Result |
|--------|--------|
| CPU usage | **NOT MEASURED** |
| Dropped frames | **NOT MEASURED** |

---

## 8. Failure Inventory

| Mode | Status |
|------|--------|
| Frame drops / memory spikes / startup regression | **UNPROVEN** (no numbers) |
| Navigation / search stalls | **UNPROVEN** |
| Crash-free TF/device window | **NOT MEASURED** → **Crash-Free FAIL** |
| Heaviness SoT missing | **DOCUMENTED** |
| Resource budgets | Reviewed as existing web gates only — **not raised** (`budget-note.json`) |

---

## 9. Final Decision

### Required board

```text
Startup PASS     → FAIL
Navigation PASS  → FAIL
Mushaf PASS      → FAIL
Prayer PASS      → FAIL
Crash-Free PASS  → FAIL
```

### Exit code

```text
MOBILE_PERFORMANCE_NOT_CERTIFIED
T-041=FAIL
DEVICE_MATRIX_PREREQ=INCOMPLETE
HEAVINESS_REPORT=MISSING
MUSHAF_EDITS=NONE
BUDGET_RAISED=false
U5_U9=NOT_STARTED
TESTFLIGHT=NOT_STARTED
STORE_READINESS=NOT_STARTED
```

**Verdict: FAIL** — do not claim `MOBILE_PERFORMANCE_CERTIFIED`. Do not start U5–U9 / TestFlight / Store Readiness until numeric Device/OS/Build/Metric/Result tables exist for Startup–Crash-Free on iPhone/iPad.
