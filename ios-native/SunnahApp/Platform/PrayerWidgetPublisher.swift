import Foundation
import WidgetKit
import SunnahPrayer

/// ينشر مواقيت اليوم (والأيام التالية) من PrayerCalculator إلى App Group ليقرأها ودجت «الصلاة القادمة».
/// استدعاء فقط للمحرك — لا تعديل عليه.
enum PrayerWidgetPublisher {
    private static func ms(_ d: Date) -> Int64 { Int64(d.timeIntervalSince1970 * 1000) }

    private static func slots(_ day: DayPrayerTimes) -> [String: Int64] {
        var out: [String: Int64] = [:]
        for (p, t) in day.ordered where p.isObligatory { out[p.rawValue] = ms(t) }
        return out
    }

    @MainActor @discardableResult
    static func publish(now: Date = Date()) -> Bool {
        let prefs = PrayerPreferencesStore.read() ?? PrayerPreferences()
        let loc = prefs.location
        guard let tz = TimeZone(identifier: loc.timeZoneIdentifier) else { return false }
        let days = PrayerCalculator.days(for: loc, from: now, count: 4, settings: prefs.settings)
        guard let today = days.first else { return false }
        let all = days.flatMap { $0.ordered }.filter { $0.prayer.isObligatory }
        let upcoming = all.filter { $0.time > now }
        let past = all.filter { $0.time <= now }
        let next = upcoming.first
        let prev = past.last
        let snap = SharedPrayerSnapshot(
            schemaVersion: SharedPrayerSnapshot.currentSchema,
            locationLabel: loc.label,
            timeZoneIdentifier: loc.timeZoneIdentifier,
            dayKey: SunnahSharedStore.dayKey(for: now, timeZone: tz),
            timesEpochMs: slots(today),
            nextPrayerKey: next?.prayer.rawValue,
            nextPrayerNameAr: next?.prayer.nameAr,
            nextPrayerEpochMs: next.map { ms($0.time) },
            nextHasStarted: false,
            previousPrayerKey: prev?.prayer.rawValue,
            previousPrayerNameAr: prev?.prayer.nameAr,
            previousPrayerEpochMs: prev.map { ms($0.time) },
            currentPrayerKey: prev?.prayer.rawValue,
            currentPrayerNameAr: prev?.prayer.nameAr,
            currentPrayerStartedAtEpochMs: prev.map { ms($0.time) },
            nextTransitionAtEpochMs: next.map { ms($0.time) },
            calculationDate: today.dayKey,
            calculationMethodIdentifier: prefs.settings.method.rawValue,
            updatedAtEpochMs: ms(now),
            upcomingDays: days.dropFirst().map { SharedPrayerDay(dayKey: $0.dayKey, timesEpochMs: slots($0)) }
        )
        let ok = SunnahSharedStore.publishPrayer(snap)
        if ok { WidgetCenter.shared.reloadAllTimelines() }
        return ok
    }
}
