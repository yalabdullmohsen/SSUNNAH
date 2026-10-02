# T-039 — iOS Accessibility Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-039 IOS_ACCESSIBILITY_CERTIFICATION` |
| Date (UTC) | `2026-10-02` |
| Tip / branch | `cursor/t039-ios-accessibility-certification` |
| Evidence | `docs/audit/evidence/t039-ios-a11y/` |
| Exit | **`IOS_ACCESSIBILITY_NOT_CERTIFIED`** → **FAIL** |

### Prerequisite corrections (vs CURRENT STATE)

| Claim | Honest tip |
|-------|------------|
| Push CERTIFIED | **FALSE** — T-038 `IOS_PUSH_NOT_CERTIFIED` |

Sacred: **no Mushaf edits**. Button Authority: **record only** — no U5 fixes.

Scoped screens (device VoiceOver matrix): Home · Search · Quran Hub · Mushaf · Prayer · Lessons · Hadith · Settings · Account → **NOT RUN**.

---

## 1. VoiceOver Validation

| Screen / feature | Mode | Outcome |
|------------------|------|---------|
| All scoped screens | VoiceOver | **FAIL** — not exercised on iPhone/iPad |
| Mushaf reader | VoiceOver | **FAIL / UNPROVEN** — mapping/selection stability not device-proven |
| Prayer names / countdown / notifications | VoiceOver | **FAIL / UNPROVEN** |

**Board: VoiceOver FAIL**

---

## 2. Dynamic Type Validation

| Check | Outcome |
|-------|---------|
| Dynamic Type | **FAIL** — NOT MEASURED |
| Large Text | **FAIL** — NOT MEASURED |

**Board: Dynamic Type FAIL**

---

## 3. Contrast Validation

| Check | Outcome |
|-------|---------|
| Increase Contrast (iOS setting) | **FAIL** — NOT MEASURED on device |
| Differentiate Without Color | **FAIL** — NOT MEASURED |
| Static token/AA contrast gate | **PASS (static)** — `a11y-contrast-100-gate` (`static/a11y-contrast-100.log`) |

**Board: Contrast FAIL** for device certification exit (static ≠ device Increase Contrast PASS).

---

## 4. RTL Validation

| Check | Outcome |
|-------|---------|
| Product RTL-first | **PARTIAL** — architecture default Arabic RTL |
| Device matrix of scoped screens under VoiceOver+RTL | **FAIL / UNPROVEN** |

**Board: RTL FAIL** for full certification (no per-screen device log).

---

## 5. Mushaf Validation

| Check | Outcome |
|-------|---------|
| VoiceOver does not break reader | **UNPROVEN** |
| Page mapping intact | **NO EDITS** this phase; device VO proof missing |
| Selections stable under a11y modes | **UNPROVEN** |
| Static mushaf a11y offline/memory gate | **PASS (static)** — `mushaf-final-6-a11y-offline-memory-gate` |

---

## 6. Prayer Validation

| Check | Outcome |
|-------|---------|
| Prayer names readable (VO) | **UNPROVEN** |
| Countdown accessible | **UNPROVEN** |
| Notifications accessible | **UNPROVEN** |

---

## 7. Known Accessibility Debt

| Item | Notes |
|------|-------|
| Unlabeled / icon-button heuristic samples | **18** candidate `<button>` snippets without `aria-label` near Icon/svg (`static/inventory.json`) — **not fixed** (U5 out of scope) |
| Reduce Motion | **84** CSS files mention `prefers-reduced-motion`; **device** Reduce Motion behavior **UNPROVEN** |
| Hardware Keyboard (iPad) | **NOT MEASURED** |
| Focus Navigation | **NOT MEASURED** |
| Push prereq | NOT CERTIFIED |

---

## 8. Exit Decision

### Required board

```text
VoiceOver PASS      → FAIL
Dynamic Type PASS   → FAIL
Reduce Motion PASS  → FAIL
Contrast PASS       → FAIL (device)
RTL PASS            → FAIL (device matrix)
```

### Exit code

```text
IOS_ACCESSIBILITY_NOT_CERTIFIED
T-039=FAIL
PUSH_PREREQ=NOT_CERTIFIED
VOICEOVER=NOT_MEASURED
DYNAMIC_TYPE=NOT_MEASURED
REDUCE_MOTION_DEVICE=NOT_MEASURED
MUSHAF_EDITS=NONE
U5_EDITS=NONE
DEVICE_MATRIX=NOT_STARTED
PERF_CERT=NOT_STARTED
TESTFLIGHT=NOT_STARTED
APP_STORE_READINESS=NOT_STARTED
```

**Verdict: FAIL** — do not claim `IOS_ACCESSIBILITY_CERTIFIED`. Do not start Device Matrix / Performance / TestFlight / App Store Readiness until VoiceOver–RTL board is proven on device.
