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

---

## 1. Device Inventory

| Device | Role | Result |
|--------|------|--------|
| iPhone 17 Pro Simulator | Shell screenshots only | Cap Home + UL attempt (`sim/01-home.png`, `02-mushaf-ul-attempt.png`) |
| iPad | Split View matrix | **NOT RUN** |
| Physical iPhone / iPad | FPS · memory · 25/50/100 | **NOT MEASURED** |

---

## 2. Page Turn Metrics

| Matrix | Result | Numbers |
|--------|--------|---------|
| 25 page turns | **FAIL** | Device turns / unlock ms / touch latency = **NOT MEASURED** |
| 50 page turns | **FAIL** | **NOT MEASURED** |
| 100 page turns | **FAIL** | **NOT MEASURED** |
| Rotation | **FAIL** | **NOT MEASURED** on Mushaf |
| Background / Resume | **FAIL** | **NOT MEASURED** on Mushaf |
| Audio / Lock interruption | **FAIL** | **NOT MEASURED** |

Repo fluidity model (not device wall-clock): estimated turn render hotspots BEFORE **64** → AFTER **0** (`mushaf-fluidity-delta.json`). **Does not certify** 25/50/100.

---

## 3. Memory Metrics

| Metric | Value |
|--------|-------|
| Memory after 25 turns | **NOT MEASURED** |
| Memory after 50 turns | **NOT MEASURED** |
| Memory after 100 turns | **NOT MEASURED** |
| Memory spikes | **NOT MEASURED** |

---

## 4. FPS Metrics

| Metric | Value |
|--------|-------|
| FPS during turns | **NOT MEASURED** |
| Dropped frames | **NOT MEASURED** |
| CPU usage | **NOT MEASURED** |
| Page unlock time | **NOT MEASURED** |
| Touch latency | **NOT MEASURED** |

No SMOOTH/FAST/OPTIMIZED claims.

---

## 5. Search Validation

| Check | Result |
|-------|--------|
| Device Mushaf Search | **FAIL / UNPROVEN** |

---

## 6. Tafsir Validation

| Check | Result |
|-------|--------|
| Device Tafsir open/use without corruption | **FAIL / UNPROVEN** |
| Static isolation gate | Code gate exists (`mushaf-tafsir-state-isolation-gate`) — **not** device PASS |

---

## 7. Bookmark Validation

| Check | Result |
|-------|--------|
| Device bookmark add/restore | **FAIL / UNPROVEN** |
| Static advanced bookmarks gate | Present in unit suite — **not** device PASS |

---

## 8. Integrity Gates

| Gate | Result | Evidence |
|------|--------|----------|
| 604 pages | **PASS (static)** | `mushaf-604-integrity-gate`: pages=604 ayahs=6236 lineSlots=8820 |
| Final integrity freeze | **PASS (static)** | `mushaf-final-integrity-freeze-gate: ok` |
| Page / ayah / audio mapping (device) | **UNPROVEN** beyond static gates |
| Checksum (device pack) | **UNPROVEN** as iOS device cert row |
| CLS = 0 (physical) | **NOT MEASURED** |

**Board Integrity: PARTIAL** — static PASS ≠ `MUSHAF_IOS_CERTIFIED` Integrity PASS.

---

## 9. Failure Modes / Root causes (from fluidity SoT; heaviness file missing)

| Topic (heaviness checklist) | Recorded impact |
|-----------------------------|-----------------|
| DOM × 3 panels | Still architecture; severity model `DOM_WORDS_X3_COMPOSITE` — device cost **UNKNOWN** |
| fontReady impact | `PRODUCT_LOCK_FONT_LAYOUT` / `FONT_MISS_ON_TARGET` — device wall-clock **DEVICE_REQUIRED** |
| pager locking | SETTLE_MS=220 kept; unlock telemetry added in repo — **not** device-proven |
| per-word subscriptions | Mitigated in-repo (`subscribeNoop` / syncHighlights freeze) — hotspots 64→0 **model only** |
| selection getClientRects | Frozen while turning (repo) — residual severity 2 |
| reader snapshots | Not re-measured on device this phase |

Documented failure modes **unproven on device:** frame drops · memory spikes · page/bookmark/search/tafsir corruption · audio desync.

---

## 10. Exit Decision

### Required board

```text
25 PASS          → FAIL
50 PASS          → FAIL
100 PASS         → FAIL
Search PASS      → FAIL
Bookmarks PASS   → FAIL
Tafsir PASS      → FAIL
Integrity PASS   → PARTIAL (static only) → not certified
```

### Exit code

```text
MUSHAF_IOS_NOT_CERTIFIED
T-036=FAIL
HEAVINESS_REPORT=MISSING
DEVICE_FPS=NOT_MEASURED
DEVICE_MEMORY=NOT_MEASURED
TURNS_25_50_100=NOT_MEASURED
SACRED_BOUNDARY=NO_EDITS
STATIC_604=PASS
PRAYER_CERT=NOT_STARTED
PUSH_CERT=NOT_STARTED
A11Y_CERT=NOT_STARTED
DEVICE_MATRIX=NOT_STARTED
TESTFLIGHT=NOT_STARTED
STORE_UPLOAD=NOT_STARTED
```

**Verdict: FAIL** — do not claim `MUSHAF_IOS_CERTIFIED`. Do not start Prayer / Push / Accessibility / Device Matrix / TestFlight / Store Upload until numeric device evidence for 25/50/100 + Search/Bookmarks/Tafsir + Integrity (including CLS=0) exists.
