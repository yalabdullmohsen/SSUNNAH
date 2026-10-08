import Foundation
import SunnahPrayer

/// مواقيت معرض الودجات من محرّك SunnahPrayer الحقيقي (لا أرقام مصنوعة).
public struct GalleryPrayerDay: Equatable, Sendable {
    public let label: String
    public let timeZoneIdentifier: String
    public let dayKey: String
    /// مفاتيح fajr…isha بالميلي ثانية.
    public let timesEpochMs: [String: Int64]
    public let nextKey: String
    public let nextNameAr: String
    public let nextEpochMs: Int64
}

public enum GalleryPrayer {
    public static let defaultLocation = PrayerLocation(
        label: "مدينة الكويت", latitude: 29.3759, longitude: 47.9774, timeZoneIdentifier: "Asia/Kuwait"
    )

    public static func day(
        now: Date,
        location: PrayerLocation = defaultLocation,
        settings: PrayerSettings = PrayerSettings()
    ) -> GalleryPrayerDay? {
        guard let today = PrayerCalculator.times(for: location, on: now, settings: settings),
              let next = PrayerCalculator.next(after: now, location: location, settings: settings)
        else { return nil }
        func ms(_ d: Date) -> Int64 { Int64(d.timeIntervalSince1970 * 1000) }
        return GalleryPrayerDay(
            label: location.label,
            timeZoneIdentifier: location.timeZoneIdentifier,
            dayKey: today.dayKey,
            timesEpochMs: Dictionary(uniqueKeysWithValues: today.times.map { ($0.key.rawValue, ms($0.value)) }),
            nextKey: next.prayer.rawValue,
            nextNameAr: next.prayer.nameAr,
            nextEpochMs: ms(next.time)
        )
    }
}
