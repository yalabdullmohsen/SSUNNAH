import Foundation
import WidgetKit

/// Deep link — موحّد مع Live Activity عبر Shared/SunnahPrayerDeepLink.
typealias PrayerWidgetDeepLink = SunnahPrayerDeepLink

enum PrayerSlotKey: String, CaseIterable {
    case fajr, dhuhr, asr, maghrib, isha

    var nameAr: String {
        switch self {
        case .fajr: return "الفجر"
        case .dhuhr: return "الظهر"
        case .asr: return "العصر"
        case .maghrib: return "المغرب"
        case .isha: return "العشاء"
        }
    }

    var symbolName: String {
        switch self {
        case .fajr: return "moon.stars.fill"
        case .dhuhr: return "sun.max.fill"
        case .asr: return "sun.haze.fill"
        case .maghrib: return "sunset.fill"
        case .isha: return "moon.fill"
        }
    }
}

struct PrayerTimelineSlot: Hashable {
    let key: PrayerSlotKey
    let date: Date
}

struct PrayerWidgetEntry: TimelineEntry {
    let date: Date
    let snapshot: SharedPrayerSnapshot?
    let slots: [PrayerTimelineSlot]
    let currentKey: PrayerSlotKey?
    let currentNameAr: String?
    let nextKey: PrayerSlotKey?
    let nextNameAr: String?
    let nextDate: Date?
    let nextHasStarted: Bool
    let locationLabel: String
    let lastUpdated: Date?
    let gregorianDateText: String
    let hijriDateText: String?

    static func placeholder() -> PrayerWidgetEntry {
        make(
            date: Date(),
            snapshot: SharedPrayerSnapshot(
                schemaVersion: 1,
                locationLabel: "الرياض",
                timeZoneIdentifier: "Asia/Riyadh",
                dayKey: "2026-10-01",
                timesEpochMs: [:],
                nextPrayerKey: "dhuhr",
                nextPrayerNameAr: "الظهر",
                nextPrayerEpochMs: Int64(Date().addingTimeInterval(3600).timeIntervalSince1970 * 1000),
                nextHasStarted: false,
                updatedAtEpochMs: Int64(Date().timeIntervalSince1970 * 1000)
            )
        )
    }

    static func make(date: Date, snapshot: SharedPrayerSnapshot?) -> PrayerWidgetEntry {
        let tz = TimeZone(identifier: snapshot?.timeZoneIdentifier ?? TimeZone.current.identifier)
            ?? .current
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = tz

        let slots: [PrayerTimelineSlot] = PrayerSlotKey.allCases.compactMap { key in
            guard let ms = snapshot?.timesEpochMs[key.rawValue] else { return nil }
            return PrayerTimelineSlot(key: key, date: Date(timeIntervalSince1970: TimeInterval(ms) / 1000))
        }.sorted { $0.date < $1.date }

        let nextKeyRaw = snapshot?.nextPrayerKey?.lowercased()
        let nextKey = nextKeyRaw.flatMap { PrayerSlotKey(rawValue: $0) }
        let nextDate: Date? = {
            if let ms = snapshot?.nextPrayerEpochMs {
                return Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
            }
            return slots.first(where: { $0.date > date })?.date
        }()
        let nextName = snapshot?.nextPrayerNameAr ?? nextKey?.nameAr

        // Current = last slot at or before now; if none, nil (before Fajr).
        let current = slots.last(where: { $0.date <= date })

        let lastUpdated: Date? = {
            guard let ms = snapshot?.updatedAtEpochMs, ms > 0 else { return nil }
            return Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
        }()

        let gregorian: String = {
            let f = DateFormatter()
            f.calendar = cal
            f.locale = Locale(identifier: "ar")
            f.timeZone = tz
            f.dateStyle = .medium
            f.timeStyle = .none
            return f.string(from: date)
        }()

        let hijri: String? = {
            var islamic = Calendar(identifier: .islamicUmmAlQura)
            islamic.locale = Locale(identifier: "ar")
            islamic.timeZone = tz
            let f = DateFormatter()
            f.calendar = islamic
            f.locale = Locale(identifier: "ar")
            f.timeZone = tz
            f.dateStyle = .medium
            f.timeStyle = .none
            return f.string(from: date)
        }()

        return PrayerWidgetEntry(
            date: date,
            snapshot: snapshot,
            slots: slots,
            currentKey: current?.key,
            currentNameAr: current?.key.nameAr,
            nextKey: nextKey ?? slots.first(where: { $0.date > date })?.key,
            nextNameAr: nextName,
            nextDate: nextDate,
            nextHasStarted: snapshot?.nextHasStarted ?? false,
            locationLabel: snapshot?.locationLabel ?? "",
            lastUpdated: lastUpdated,
            gregorianDateText: gregorian,
            hijriDateText: hijri
        )
    }
}

struct PrayerWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerWidgetEntry {
        .placeholder()
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerWidgetEntry) -> Void) {
        completion(PrayerWidgetEntry.make(date: Date(), snapshot: SunnahSharedStore.loadPrayer()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerWidgetEntry>) -> Void) {
        // Read-only App Group — no API, no prayer recalculation.
        let snapshot = SunnahSharedStore.loadPrayer()
        let now = Date()
        let entry = PrayerWidgetEntry.make(date: now, snapshot: snapshot)

        var dates: [Date] = [now]
        if let next = entry.nextDate, next > now {
            dates.append(next)
            // Light refresh ~15m before next prayer for UI state (not countdown — system timer handles that).
            let pre = next.addingTimeInterval(-15 * 60)
            if pre > now { dates.append(pre) }
        }
        for slot in entry.slots where slot.date > now {
            dates.append(slot.date)
        }
        // Cap refresh points — battery friendly.
        let unique = Array(Set(dates)).sorted()
        let entries = unique.prefix(8).map { PrayerWidgetEntry.make(date: $0, snapshot: snapshot) }

        let policy: TimelineReloadPolicy
        if let next = entry.nextDate, next > now {
            policy = .after(next)
        } else {
            // No schedule — retry in 30 minutes for App Group refresh from main app.
            policy = .after(now.addingTimeInterval(30 * 60))
        }
        completion(Timeline(entries: entries.isEmpty ? [entry] : Array(entries), policy: policy))
    }
}
