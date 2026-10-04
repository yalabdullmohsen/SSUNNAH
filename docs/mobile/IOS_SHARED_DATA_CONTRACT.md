# iOS Shared Data Contract — Widget / Watch / Live Activity

| Field | Value |
|-------|-------|
| App Group | `group.com.yousef.majlisilm` |
| Bundle ID | `com.yousef.majlisilm` |
| Status | **Foundation ready** · Prayer Widget Extension **present** (T-029) · Watch App **not** created |
| SoT Swift | `ios/App/Shared/SunnahSharedData.swift` |
| JS bridge | `src/lib/plugins/sunnah-shared-data.ts` |
| JS publisher | `src/lib/plugins/sunnah-shared-prayer-publish.ts` |
| Widget kind | `PrayerTimesWidget` (`SunnahWidgetKind.prayerTimes`) |
| Schema | `sunnah.shared.prayer.v1` · `schemaVersion = 1` |

## Allowed shared payloads

| Payload | Key | Consumers (future) |
|---------|-----|---------------------|
| Prayer times + next + countdown anchors | `sunnah.shared.prayer.v1` | Main · LA · Widget · Watch |
| Progress counters | `sunnah.shared.progress.v1` | Main · Widget · Watch |

## Forbidden in App Group

Auth tokens · refresh/access · passwords · API keys · credentials · Keychain mirrors.

Auth remains in `KeychainStore` service `com.yousef.majlisilm.auth` only.

## Prayer Widget (T-029 — implemented)

Target: `com.yousef.majlisilm.PrayerWidget` · folder `ios/App/PrayerWidget/`.

| Family | Kind | Data source | Content (license-safe) |
|--------|------|-------------|------------------------|
| Small | `systemSmall` | prayer.v1 | Current · next · countdown |
| Medium | `systemMedium` | prayer.v1 | Timeline · current · next |
| Large | `systemLarge` | prayer.v1 | Timeline · remaining · dates · last updated |
| Inline Lock Screen | `accessoryInline` | prayer.v1 | Next prayer name |
| Circular Lock Screen | `accessoryCircular` | prayer.v1 | Countdown |
| Rectangular Lock Screen | `accessoryRectangular` | prayer.v1 | Name + time |

Deep link: `https://www.ssunnah.com/prayer-times` (same as LA).  
No Quran text / QPC / fatwa / progress.v1 / UNKNOWN audio in widgets.  
Certification: `docs/audit/IOS_WIDGETS_PRAYER_CERTIFICATION_REPORT.md`.

## Future Watch contract (do not implement yet)

| Surface | Data | Notes |
|---------|------|-------|
| Complications | prayer.v1 next + countdown | Numbers/times only |
| Smart Stack | prayer.v1 | Prayer overview card |
| Prayer Overview | prayer.v1 day times | No corpus text |
| Countdown | prayer.v1 nextPrayerEpochMs | System timer style |

Watch app target: **not present** until a later phase.

## Live Activity (existing)

`PrayerActivityAttributes` remains ActivityKit push path.  
On start/update, `PrayerLiveActivityPlugin` also mirrors next-prayer fields into App Group via `SunnahSharedStore.publishLiveActivityState`.
