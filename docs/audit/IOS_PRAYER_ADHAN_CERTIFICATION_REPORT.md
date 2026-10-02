# T-037 — iOS Prayer & Adhan Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-037 IOS_PRAYER_ADHAN_CERTIFICATION` |
| Date (UTC) | `2026-10-02` |
| Tip commit at run | `d8af76642` (`origin/main`) |
| Evidence | `docs/audit/evidence/t037-ios-prayer-adhan/` |
| Exit | **`IOS_PRAYER_ADHAN_NOT_CERTIFIED`** → **FAIL** |

Prayer Special: **NO EDITS** to prayer calculation methods, scheduling logic, or sharʿī timing tables — verification / measurement / ops docs only.

### Prerequisite corrections (vs CURRENT STATE)

| Claim in prompt | Honest tip |
|-----------------|------------|
| Mushaf CERTIFIED | **FALSE** — T-036 `MUSHAF_IOS_NOT_CERTIFIED` |
| Istanbul `APPROVED_FOR_RELEASE` | **FALSE** — `CC0_ADHAN_REJECTED_QUALITY`; promote **CLOSED — rejected** |
| Fallback | Store posture **`system-default`** (`ADHAN_AUDIO_AUDIT` / STORE_ASSET_MANIFEST) |
| Audio | **`AUDIO_LICENSE_PARTIAL`** · `AUDIO_CERTIFIED=false` |

---

## 1. Prayer Engine Validation

| Check | Result |
|-------|--------|
| Engine protected / unit P0 | **PASS (static)** — `test:prayer-engine-p0` + notification scheduler rebuild (`static/prayer-engine-p0.log`) |
| Device FG/BG/Terminated delivery | **FAIL / UNPROVEN** |
| Calc/method/schedule edits this phase | **NONE** |

---

## 2. Adhan Validation

| Check | Result |
|-------|--------|
| Audio fires correctly (device scenarios) | **FAIL** — not measured on device |
| Fallback works | **PARTIAL (policy)** — Istanbul rejected; Store default `system-default`; device fire of fallback **UNPROVEN** |
| No duplicate / double trigger (device) | **FAIL / UNPROVEN** |
| Static cancel / playback modes | **PASS (static)** — `adhan-smart-cancel` · `adhan-playback-modes` |

---

## 3. Notification Validation

| Scenario | Result |
|----------|--------|
| Foreground | **FAIL** |
| Background | **FAIL** |
| Terminated App | **FAIL** |
| Locked Screen | **FAIL** |
| Airplane / Focus / Silent / Low Power | **FAIL / UNPROVEN** |
| Notification opens app | **FAIL / UNPROVEN** |
| Device Reboot | **FAIL / UNPROVEN** |

---

## 4. Timeline Validation

| Check | Result |
|-------|--------|
| Next prayer / countdown accuracy (device) | **UNPROVEN** |
| Rollover / midnight / DST | **UNPROVEN** |
| Timezone change | **FAIL / UNPROVEN** (static fingerprint invalidate exists; not device) |
| Location change | **FAIL / UNPROVEN** |

---

## 5. Live Activity Validation

| Check | Result |
|-------|--------|
| T-031 phases + Dynamic Island UI | **PASS (prior cert)** — `PRAYER_LIVE_ACTIVITY_CERTIFIED` |
| Countdown/next-prayer updates under Adhan delivery matrix | **UNPROVEN** as part of this exit |
| Tap open / lock screen under interrupted Adhan | **UNPROVEN** |

LA cert ≠ Adhan delivery cert.

---

## 6. Accessibility Validation

| Check | Result |
|-------|--------|
| VoiceOver announcement | **UNPROVEN** |
| Arabic prayer names / countdown labels | **UNPROVEN** (A11y certification not started) |

---

## 7. Failure Modes

| Mode | Status |
|------|--------|
| Missed / delayed / duplicate Adhan | **UNPROVEN** on device |
| Notification / background failure | **UNPROVEN** |
| Timezone mismatch | **UNPROVEN** |
| Istanbul quality rejection | **DOCUMENTED** — not releasable as primary Adhan |
| License partial assets in tree | **DOCUMENTED** — blocks `AUDIO_CERTIFIED` |
| Local `verify:ci` push gate | **BLOCKED (Class B)** — `tolerant-search` `<150ms` flake (~163–179ms); unrelated to this diff; one Class-C retry also failed |

Sim note: `sim/01-home.png` = Cap shell only; not Adhan fire proof.  
Artifacts remain on branch working tree; no push while `verify:ci` red.

---

## 8. Exit Decision

### Required board

```text
Foreground PASS   → FAIL
Background PASS   → FAIL
Terminated PASS   → FAIL
Locked PASS       → FAIL
Timezone PASS     → FAIL
Location PASS     → FAIL
```

### Exit code

```text
IOS_PRAYER_ADHAN_NOT_CERTIFIED
T-037=FAIL
AUDIO=AUDIO_LICENSE_PARTIAL
ISTANBUL=CC0_ADHAN_REJECTED_QUALITY
STORE_FALLBACK=system-default
LIVE_ACTIVITY_UI=CERTIFIED (T-031)
ADHAN_DEVICE_DELIVERY=NOT_MEASURED
PRAYER_ENGINE_EDITS=NONE
MUSHAF_PREREQ=NOT_CERTIFIED
PUSH_CERT=NOT_STARTED
A11Y_CERT=NOT_STARTED
DEVICE_MATRIX=NOT_STARTED
TESTFLIGHT=NOT_STARTED
STORE_READINESS=NOT_STARTED
```

**Verdict: FAIL** — do not claim `IOS_PRAYER_ADHAN_CERTIFIED`. Do not start Push / Accessibility / Device Matrix / TestFlight / Store Readiness until Foreground–Location Adhan delivery board is proven on device with licensed/fallback audio.
