import Foundation
import WidgetKit
import os

/// Deep link — موحّد مع Live Activity عبر Shared/SunnahPrayerDeepLink.
typealias PrayerWidgetDeepLink = SunnahPrayerDeepLink

private let widgetLog = Logger(subsystem: "com.yousef.majlisilm", category: "PrayerWidget")

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
    let dataState: PrayerWidgetDataState
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

    /// Representative gallery/preview content — not live device data.
    static func placeholder() -> PrayerWidgetEntry {
        let tz = TimeZone(identifier: "Asia/Riyadh") ?? .current
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = tz
        let dayStart = cal.startOfDay(for: Date())
        func at(_ hour: Int, _ minute: Int) -> Int64 {
            let d = cal.date(byAdding: DateComponents(hour: hour, minute: minute), to: dayStart) ?? dayStart
            return Int64(d.timeIntervalSince1970 * 1000)
        }
        let times: [String: Int64] = [
            "fajr": at(5, 5),
            "dhuhr": at(12, 10),
            "asr": at(15, 30),
            "maghrib": at(18, 5),
            "isha": at(19, 30),
        ]
        let now = Date()
        let nextKey = "dhuhr"
        let nextMs = times[nextKey] ?? at(12, 10)
        return make(
            date: now,
            snapshot: SharedPrayerSnapshot(
                schemaVersion: SharedPrayerSnapshot.currentSchema,
                locationLabel: "معاينة",
                timeZoneIdentifier: tz.identifier,
                dayKey: SunnahSharedStore.dayKey(for: now, timeZone: tz),
                timesEpochMs: times,
                nextPrayerKey: nextKey,
                nextPrayerNameAr: "الظهر",
                nextPrayerEpochMs: nextMs,
                nextHasStarted: false,
                updatedAtEpochMs: Int64(now.timeIntervalSince1970 * 1000)
            ),
            isPreview: true
        )
    }

    static func make(date: Date, snapshot: SharedPrayerSnapshot?, isPreview: Bool = false) -> PrayerWidgetEntry {
        let state = isPreview ? PrayerWidgetDataState.validData : SunnahSharedStore.classifyPrayerData(snapshot, now: date)
        let tz = TimeZone(identifier: snapshot?.timeZoneIdentifier ?? TimeZone.current.identifier)
            ?? .current
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = tz

        let slots: [PrayerTimelineSlot] = PrayerSlotKey.allCases.compactMap { key in
            guard let ms = snapshot?.timesEpochMs[key.rawValue] else { return nil }
            return PrayerTimelineSlot(key: key, date: Date(timeIntervalSince1970: TimeInterval(ms) / 1000))
        }.sorted { $0.date < $1.date }

        // Prefer slot-derived next relative to this entry date; fall back to snapshot anchors
        // (needed after Isha when next is tomorrow Fajr not present in today's times map).
        let derivedNext = slots.first(where: { $0.date > date })
        let snapshotNextDate: Date? = {
            guard let ms = snapshot?.nextPrayerEpochMs else { return nil }
            return Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
        }()
        let nextDate: Date? = {
            if let d = derivedNext?.date { return d }
            if let d = snapshotNextDate, d > date { return d }
            return nil
        }()
        let nextKey: PrayerSlotKey? = {
            if let k = derivedNext?.key { return k }
            if let raw = snapshot?.nextPrayerKey?.lowercased(),
               let k = PrayerSlotKey(rawValue: raw),
               let d = snapshotNextDate, d > date {
                return k
            }
            return nil
        }()
        let nextName = nextKey?.nameAr ?? snapshot?.nextPrayerNameAr

        // Current = last slot at or before now; if none, nil (before Fajr).
        let current = slots.last(where: { $0.date <= date })

        let nextHasStarted: Bool = {
            if let end = nextDate, end <= date { return true }
            if let snapStarted = snapshot?.nextHasStarted,
               let snapEnd = snapshotNextDate,
               abs(snapEnd.timeIntervalSince(date)) < 60 {
                return snapStarted
            }
            return false
        }()

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
            dataState: state,
            slots: slots,
            currentKey: current?.key,
            currentNameAr: current?.key.nameAr,
            nextKey: nextKey,
            nextNameAr: nextName,
            nextDate: nextDate,
            nextHasStarted: nextHasStarted,
            locationLabel: isPreview ? "معاينة" : (snapshot?.locationLabel ?? ""),
            lastUpdated: lastUpdated,
            gregorianDateText: gregorian,
            hijriDateText: hijri
        )
    }

    var needsAppOpenAction: Bool {
        switch dataState {
        case .noDataYet, .malformedData, .appOpenRequired:
            return true
        case .staleData, .validData:
            return false
        }
    }
}

struct PrayerWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerWidgetEntry {
        .placeholder()
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerWidgetEntry) -> Void) {
        if context.isPreview {
            completion(.placeholder())
            return
        }
        let snapshot = SunnahSharedStore.loadPrayer()
        let entry = PrayerWidgetEntry.make(date: Date(), snapshot: snapshot)
        #if DEBUG
        widgetLog.debug("snapshot state=\(entry.dataState.rawValue, privacy: .public)")
        #endif
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerWidgetEntry>) -> Void) {
        // Read-only App Group — no API, no prayer recalculation.
        let snapshot = SunnahSharedStore.loadPrayer()
        let now = Date()
        let entry = PrayerWidgetEntry.make(date: now, snapshot: snapshot)
        #if DEBUG
        widgetLog.debug("timeline generated state=\(entry.dataState.rawValue, privacy: .public) slots=\(entry.slots.count)")
        #endif

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
        } else if entry.needsAppOpenAction {
            // Missing data — retry sooner so an app open can populate App Group.
            policy = .after(now.addingTimeInterval(15 * 60))
        } else {
            policy = .after(now.addingTimeInterval(30 * 60))
        }
        completion(Timeline(entries: entries.isEmpty ? [entry] : Array(entries), policy: policy))
    }
}
