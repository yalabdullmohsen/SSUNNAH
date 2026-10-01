# iOS Shared Data Contract — Widget / Watch / Live Activity

| Field | Value |
|-------|-------|
| App Group | `group.com.yousef.majlisilm` |
| Bundle ID | `com.yousef.majlisilm` |
| Status | **Foundation prepared** — Widget Extension / Watch App **not** created (T-028) |
| SoT Swift | `ios/App/Shared/SunnahSharedData.swift` |
| JS bridge | `src/lib/plugins/sunnah-shared-data.ts` |

## Allowed shared payloads

| Payload | Key | Consumers (future) |
|---------|-----|---------------------|
| Prayer times + next + countdown anchors | `sunnah.shared.prayer.v1` | Main · LA · Widget · Watch |
| Progress counters | `sunnah.shared.progress.v1` | Main · Widget · Watch |

## Forbidden in App Group

Auth tokens · refresh/access · passwords · API keys · credentials · Keychain mirrors.

Auth remains in `KeychainStore` service `com.yousef.majlisilm.auth` only.

## Future Widget contract (do not implement yet)

| Family | Kind | Data source | Content (license-safe) |
|--------|------|-------------|------------------------|
| Small | `systemSmall` | prayer.v1 | Next prayer name + countdown |
| Medium | `systemMedium` | prayer.v1 | Next + today’s times strip |
| Large | `systemLarge` | prayer.v1 + progress.v1 | Day grid + wird progress |
| Inline Lock Screen | `accessoryInline` | prayer.v1 | Next prayer name |
| Circular Lock Screen | `accessoryCircular` | prayer.v1 | Countdown ring |
| Rectangular Lock Screen | `accessoryRectangular` | prayer.v1 | Name + time |

Deep link: `https://www.ssunnah.com/prayer-times` (same as LA).  
No Quran text / QPC / fatwa bodies / UNKNOWN audio in widgets.

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
