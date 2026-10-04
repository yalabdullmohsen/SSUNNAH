# iOS Sunnah Widget Platform Contract

| Field | Value |
|-------|-------|
| Gate | `IOS_SUNNAH_WIDGET_PLATFORM_CONTRACT_GATE` |
| App Group | `group.com.yousef.majlisilm` |
| Widget target | `com.yousef.majlisilm.PrayerWidget` (`PrayerWidgetExtension`) |
| Envelope | `sunnah.shared.envelope.v1` · `schemaVersion = 1` |
| Legacy prayer key | `sunnah.shared.prayer.v1` |
| Build in repo | **55** (unchanged) |
| Installed binary | Build 55 does **not** contain these sources |
| Exit | **FUTURE_IOS_UPDATE_REQUIRED** |

## CURRENT_WIDGET_ROOT_CAUSE_PROVEN

Classification: **MULTIPLE_CAUSES**

Observed gallery card (`مواقيت الصلاة` / `الصلاة` / `—` / `—`) came from:

1. `getSnapshot` used live App Group unless `context.isPreview`. Lock Screen gallery often has `isPreview = false` with an empty suite → incomplete next prayer.
2. `Text(timerInterval:)` in a static snapshot commonly renders `—`.
3. Accessory rectangular fallback `nextNameAr ?? "الصلاة"` when next was nil.
4. Placeholder times were wall-clock **today**, so after Isha `nextDate` collapsed.
5. Installed Build 55 may predate repository placeholder work.

Live Lock Screen data on device proved App Group I/O can work. The gallery dash is a snapshot/placeholder/renderer contract defect, not a missing widget target.

## Architecture

Single platform hosted by the existing `PrayerWidget` target:

- `SunnahWidgetKind` registry (unique kinds)
- `SunnahWidgetEnvelope` isolated domain decode
- `SunnahWidgetRefreshCoordinator` write-then-reload
- `SunnahWidgetDeepLinkFactory` existing `https://www.ssunnah.com/...` URLs
- `SunnahWidgetTheme` native emerald / restrained gold
- `SunnahWidgetPreviewFixtures` sample-only, never written to App Group
- Domain adapters read canonical payloads only

No second Widget target. PR #2299 App Group `group.com.yousef.majlisilm.widgets` is not revived.

## Families

Each kind declares only purpose-built families. Six prayer times are not forced into `systemSmall`.

## Release hold

No Archive, TestFlight, App Store, signing, or Build increment. A future iOS binary is required for users to receive these widgets.
