# T-031 — Prayer Live Activity Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-031 PRAYER_LIVE_ACTIVITY_COMPLETION` |
| Date (UTC) | `2026-10-01` |
| Bundle ID | `com.yousef.majlisilm` |
| LA extension | `com.yousef.majlisilm.PrayerLiveActivity` |
| App Group | `group.com.yousef.majlisilm` |
| Exit | **`PRAYER_LIVE_ACTIVITY_CERTIFIED`** |

Depends on: App Groups foundation · Prayer Widgets (T-029).  
Operator asserted Watch CERTIFIED; `APPLE_WATCH_PRAYER_CERTIFICATION_REPORT.md` was **not present on tip** at T-031 start — out of scope (not started here).

---

## 1. State Inventory

| State | Phase | Lock Screen | Status |
|-------|-------|-------------|--------|
| Upcoming Prayer | `upcoming` | Name + remaining countdown | **PASS** |
| Active Prayer Window | `active` | Current prayer + status «حان الآن» | **PASS** |
| Prayer Completed | `completed` | Next prayer + countdown | **PASS** |
| App Launch State | `appLaunch` | «افتح مواقيت الصلاة» CTA | **PASS** |

Allowed only: current/next prayer · remaining · countdown · status.  
Blocked absent: Quran / QPC / Adhkar / Fatwa / lessons / books / recitation.

Scheduler transitions:

1. Pre-alert window → `upcoming`
2. Enter time → `active`
3. After linger → `completed` (next slot from schedule list, no recalculation)
4. No enabled slots → `appLaunch`

---

## 2. Dynamic Island States

| Region | Upcoming | Active | Completed | App Launch | Status |
|--------|----------|--------|-----------|------------|--------|
| Compact Leading | Symbol | Symbol | Next symbol | Symbol | **PASS** |
| Compact Trailing | Countdown | «الآن» | Next countdown | «افتح» | **PASS** |
| Minimal | Symbol | Symbol | Symbol | Symbol | **PASS** |
| Expanded L/C/T/B | Name + timer + copy | Status + name | Next + timer | CTA | **PASS** |

Tokens: `SunnahBrandColors` (shared with Widget/LA — no parallel theme).

---

## 3. Deep Link Integration

| Check | Result |
|-------|--------|
| URL | `https://www.ssunnah.com/prayer-times` |
| Shared constant | `Shared/SunnahPrayerDeepLink.swift` |
| Lock Screen `widgetURL` | ✓ |
| Dynamic Island `widgetURL` | ✓ |
| Same as Widget | ✓ |

**Deep Link PASS**

---

## 4. App Group Integration

| Check | Result |
|-------|--------|
| Mirror on start/update | `SunnahSharedStore.publishLiveActivityState` |
| Sync reader | `syncFromSharedSnapshot` (no network) |
| Data source | `sunnah.shared.prayer.v1` only |
| Duplicate prayer engine | Forbidden / absent |
| URLSession in plugin | Absent |

**App Group PASS**

---

## 5. Accessibility Validation

| Check | Evidence |
|-------|----------|
| VoiceOver labels | `accessibilityLabel` on DI + lock |
| RTL | `.environment(\.layoutDirection, .rightToLeft)` |
| Arabic names | Status/copy in Arabic |
| Accessible countdown | Labeled timer intervals |
| Locale | `ar` on lock/expanded bottom |

Full device VoiceOver matrix = later Accessibility Certification (not started).

---

## 6. Screenshots

| Evidence | Status |
|----------|--------|
| `xcodebuild` Debug Simulator | **BUILD SUCCEEDED** (App + LA + Widget PlugIns) |
| State coverage | Code paths for all 4 phases in UI + plugin + scheduler |
| Device photo gallery | OWNER_ACTION / TestFlight — not required for this exit |

---

## 7. Exit Decision

```text
Upcoming PASS
Active PASS
Completed PASS
Dynamic Island PASS
Deep Link PASS
```

```text
PRAYER_LIVE_ACTIVITY_CERTIFIED
LA_BUNDLE_ID=com.yousef.majlisilm.PrayerLiveActivity
APP_GROUP=group.com.yousef.majlisilm
CONTENT_SCOPE=PRAYER_ONLY
APP_SHELL=NOT_STARTED
DEEP_LINKS_CERT=NOT_STARTED
AUTH_CERT=NOT_STARTED
DEVICE_MATRIX=NOT_STARTED
TESTFLIGHT=NOT_STARTED
```

**Verdict:** Prayer Live Activity state machine + Dynamic Island + App Group sync + unified deep link certified. Do not start App Shell / Deep Links / Auth / Device Matrix / TestFlight / Store until this exit is accepted.
