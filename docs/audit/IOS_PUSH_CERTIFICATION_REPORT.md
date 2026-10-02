# T-038 — iOS Push Notifications Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-038 IOS_PUSH_CERTIFICATION` |
| Date (UTC) | `2026-10-02` |
| Tip commit at run | `ef2d35a0e` (`origin/main` at checkout) |
| Evidence | `docs/audit/evidence/t038-ios-push/` |
| Exit | **`IOS_PUSH_NOT_CERTIFIED`** → **FAIL** |

### Prerequisite corrections (vs CURRENT STATE)

| Claim | Honest tip |
|-------|------------|
| Prayer CERTIFIED | **FALSE** — T-037 `IOS_PRAYER_ADHAN_NOT_CERTIFIED` |
| Adhan CERTIFIED | **FALSE** — same T-037 FAIL · `AUDIO_LICENSE_PARTIAL` |

Corpus policy this phase: **no** Quran / Hisn / Fatwa corpus text used in notification bodies for certification claims.

---

## 1. Notification Types

| Type | Device proof |
|------|----------------|
| Prayer Reminder | **UNPROVEN** (overlaps T-037 delivery gap) |
| Prayer Countdown | **UNPROVEN** |
| App-generated informational | **UNPROVEN** |

Static wiring: Capacitor `PushNotifications` config · `aps-environment` · `push-notifications.ts` native-gated · Sunnah channels/quiet-hours/deduplicator present (`static/inventory.json`).

---

## 2. Delivery Validation

| Scenario | Result |
|----------|--------|
| Foreground Notification | **FAIL** |
| Background Notification | **FAIL** |
| Terminated App Notification | **FAIL** |
| Cold Start From Notification | **FAIL** |
| Permission Denied | **UNPROVEN** |
| Permission Granted Later | **UNPROVEN** |
| Quiet Hours (device outcome) | **UNPROVEN** (static policy PASS) |

Sim: `sim/01-home.png` = Cap shell only — not APNs delivery.

---

## 3. Deep Link Validation

| Check | Result |
|-------|--------|
| Notification action → correct route | **FAIL / UNPROVEN** |
| Preserve app state / nav stack | **UNPROVEN** |
| Deep Links cert prereq | T-033 `IOS_DEEP_LINKS_NOT_CERTIFIED` |

---

## 4. Token Validation

| Check | Result |
|-------|--------|
| Token register (device) | **FAIL / UNPROVEN** |
| Token Refresh | **FAIL** |
| Static APNs forward / Capacitor register exports | **PASS (static)** — `notifications-hardening` |

---

## 5. Duplicate Prevention

| Check | Result |
|-------|--------|
| Device duplicate delivery | **FAIL / UNPROVEN** |
| Static deduplicator / policy gate | **PASS (static)** — `sunnah-notifications-policy-gate` · `deduplicator.ts` |

---

## 6. Failure Modes

| Mode | Status |
|------|--------|
| no delivery | **DEFAULT until device proof** |
| duplicate delivery | **UNPROVEN** |
| wrong route / expired / stale action | **UNPROVEN** |
| Prayer/Adhan not certified | Blocks claiming prayer push lane complete |

---

## 7. Exit Decision

### Required board

```text
Foreground PASS           → FAIL
Background PASS           → FAIL
Terminated PASS           → FAIL
Deep Link PASS            → FAIL
Token Refresh PASS        → FAIL
Duplicate Prevention PASS → FAIL
```

### Exit code

```text
IOS_PUSH_NOT_CERTIFIED
T-038=FAIL
STATIC_PUSH_WIRING=PASS
DEVICE_APNS_DELIVERY=NOT_MEASURED
PRAYER_ADHAN_PREREQ=NOT_CERTIFIED
DEEP_LINKS_PREREQ=NOT_CERTIFIED
A11Y_CERT=NOT_STARTED
DEVICE_MATRIX=NOT_STARTED
PERF_CERT=NOT_STARTED
TESTFLIGHT=NOT_STARTED
STORE_READINESS=NOT_STARTED
```

**Verdict: FAIL** — do not claim `IOS_PUSH_CERTIFIED`. Do not start Accessibility / Device Matrix / Performance / TestFlight / Store Readiness until the Foreground–Duplicate board is proven on device with APNs.
