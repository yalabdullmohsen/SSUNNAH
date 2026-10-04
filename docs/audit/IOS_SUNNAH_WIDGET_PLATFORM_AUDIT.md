# iOS Sunnah Widget Platform — Phase 0 forensic audit

Date: 2026-10-04  
Base: `origin/main` `f4275d913`  
Installed product: Build 55 Prayer Widget present  

## Inventory

| Area | Finding |
|------|---------|
| Target | `PrayerWidgetExtension` · `com.yousef.majlisilm.PrayerWidget` |
| Bundle | `PrayerWidgetBundle` hosts `PrayerTimesWidget` |
| Kind | `PrayerTimesWidget` |
| Families | small / medium / large / accessory inline / circular / rectangular |
| App Group | `group.com.yousef.majlisilm` in App Debug+Release, Widget, Live Activity |
| Suite key | `sunnah.shared.prayer.v1` schema 1 |
| Writer | `SunnahSharedDataPlugin.publishPrayerSnapshot` then `reloadTimelines(ofKind:)` |
| Reader | `SunnahSharedStore.loadPrayer()` |
| Deep link | `https://www.ssunnah.com/prayer-times` |
| Second target | none |
| PR #2299 group | not present |

## CURRENT_WIDGET_ROOT_CAUSE_PROVEN

**MULTIPLE_CAUSES**

Gallery preview dashes while Lock Screen live data can be valid:

- SNAPSHOT_FIXTURE_MISSING when `isPreview` is false
- PLACEHOLDER_MODEL_INCOMPLETE (today-clock times, past next after Isha)
- LIVE_PAYLOAD_NOT_AVAILABLE_IN_GALLERY
- FAMILY_RENDERER_INCOMPLETE (`timerInterval` → `—`, fallback label `الصلاة`)

Not: missing widget target, App Group identifier drift, or a second engine inside the extension.
