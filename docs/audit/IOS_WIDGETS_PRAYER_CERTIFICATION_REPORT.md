# T-029 — iOS Widgets Prayer Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-029 IOS_WIDGET_EXTENSION_PRAYER_ONLY` |
| Date (UTC) | `2026-10-01` |
| Bundle ID (app) | `com.yousef.majlisilm` |
| Widget extension | `com.yousef.majlisilm.PrayerWidget` |
| App Group | `group.com.yousef.majlisilm` |
| Exit | **`IOS_WIDGETS_PRAYER_CERTIFIED`** |

Depends on: `docs/audit/IOS_APP_GROUPS_FOUNDATION_REPORT.md` (`IOS_SHARED_DATA_FOUNDATION_READY`).

**Data publication (repo fix):** App Group snapshot is published from `publishPrayerSnapshotForWidgets` independently of alert-enabled prefs and notification schedule success; today's `timesEpochMs` no longer overwritten by tomorrow slots; WidgetKit reload uses `reloadTimelines(ofKind: PrayerTimesWidget)` after synchronize; gallery preview uses representative placeholder with always-future next; Home Screen missing data shows actionable Arabic open-app state. Catalog widgets live in separate Swift files; `PrayerTimesWidget.swift` / `PrayerWidgetEntry.swift` / `PrayerWidgetViews.swift` remain prayer-only. Gate: `IOS_PRAYER_WIDGET_DATA_CONTRACT_GATE` + `IOS_SUNNAH_WIDGET_PLATFORM_CONTRACT_GATE`. Installed App Store binaries require a future iOS update containing this fix.

---

## 1. Widget Inventory

| Target | Path | Role |
|--------|------|------|
| `PrayerWidgetExtension` | `ios/App/PrayerWidget/` | Home Screen + Lock Screen prayer widgets |
| Shared data | `ios/App/Shared/SunnahSharedData.swift` | Read-only `prayer.v1` |
| Brand tokens | `ios/App/Shared/SunnahBrandColors.swift` | Same emerald/gold as Live Activity |
| Embedded in App | `PlugIns/PrayerWidgetExtension.appex` | Coexists with `PrayerLiveActivityExtension.appex` |

Watch app: **not present** (out of scope).

---

## 2. Supported Sizes

| Family | Kind | Status | Content (allowed only) |
|--------|------|--------|------------------------|
| Small | `systemSmall` | **PASS** | Current prayer · Next prayer · Countdown |
| Medium | `systemMedium` | **PASS** | Daily timeline · Current · Next |
| Large | `systemLarge` | **PASS** | Timeline · Remaining · Gregorian date · Hijri (local `islamicUmmAlQura`) · Last updated |
| Lock Inline | `accessoryInline` | **PASS** | Next prayer name |
| Lock Circular | `accessoryCircular` | **PASS** | Symbol + countdown timer |
| Lock Rectangular | `accessoryRectangular` | **PASS** | Name · time · countdown |

Blocked content absent: Quran / QPC / Hisn / Fatwa / books / lessons / recitation / progress.v1.

---

## 3. Data Model

| Field | Source |
|-------|--------|
| Day times | `SharedPrayerSnapshot.timesEpochMs` |
| Next prayer | `nextPrayerKey` / `nextPrayerNameAr` / `nextPrayerEpochMs` |
| Countdown | System `Text(timerInterval:)` against `nextDate` |
| Current prayer | Derived as last slot ≤ now (no recalculation of adhan math) |
| Last updated | `updatedAtEpochMs` |
| Hijri | Local Foundation calendar only (no network) |

No `URLSession` / API in widget timeline. No duplicate prayer engine.

---

## 4. App Group Integration

| Check | Result |
|-------|--------|
| Entitlement `group.com.yousef.majlisilm` | ✓ Widget + App + LA |
| Read path | `SunnahSharedStore.loadPrayer()` |
| Write from widget | None (read-only) |
| Conflicting App Group | None |

Portal registration of the App Group remains **OWNER_ACTION** (unchanged from T-028).

---

## 5. Deep Link Validation

| Check | Result |
|-------|--------|
| URL | `https://www.ssunnah.com/prayer-times` |
| Attachment | `.widgetURL` on `PrayerWidgetRootView` (all families) |
| Match LA deep link | ✓ same Universal Link |

---

## 6. Accessibility Validation

| Check | Evidence |
|-------|----------|
| VoiceOver labels | `accessibilityLabel` on small/medium/large/lock views |
| Dynamic Type | Semantic fonts (`.headline`, `.caption`, `.title3`) + `minimumScaleFactor` |
| Contrast | Emerald dark gradient + white/gold text (same tokens as LA) |
| RTL | `.environment(\.layoutDirection, .rightToLeft)` + `locale=ar` |
| Arabic numerals | `Locale(identifier: "ar")` on formatters / environment |

Full VoiceOver device matrix = later Accessibility Certification phase (not started).

---

## 7. Screenshots

| Evidence | Status |
|----------|--------|
| Xcode Simulator build | **BUILD SUCCEEDED** — App embeds `PrayerWidgetExtension.appex` + `PrayerLiveActivityExtension.appex` |
| SwiftUI Previews | Six `#if DEBUG` preview families in `PrayerTimesWidget.swift` (Small→Rectangular) |
| Device photo gallery | **OWNER_ACTION** / TestFlight — not required to open exit when static + build certification pass |

Preview display names: `Small` · `Medium` · `Large` · `Inline` · `Circular` · `Rectangular`.

---

## 8. Exit Decision

### Family board

```text
Small PASS
Medium PASS
Large PASS
Inline PASS
Circular PASS
Rectangular PASS
```

### Validation

| Check | Result |
|-------|--------|
| App + widget coexist | ✓ dual PlugIns validated |
| Widget extension builds | ✓ `xcodebuild` Debug Simulator |
| App Group access prepared | ✓ entitlements + `loadPrayer` |
| No blocking archive warnings from widget sources | ✓ build clean for widget target |
| Watch not started | ✓ |

### Exit code

```text
IOS_WIDGETS_PRAYER_CERTIFIED
WIDGET_BUNDLE_ID=com.yousef.majlisilm.PrayerWidget
APP_GROUP=group.com.yousef.majlisilm
CONTENT_SCOPE=PRAYER_ONLY
WATCH=NOT_STARTED
```

**Verdict:** Prayer Widget Extension certified for the six required families. Do not start Watch / Mushaf Devices / Push / Accessibility Certification / TestFlight until this exit is accepted.
