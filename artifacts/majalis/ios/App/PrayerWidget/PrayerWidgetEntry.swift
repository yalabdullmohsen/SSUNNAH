import Foundation
import WidgetKit
import os

/// Deep link — موحّد مع Live Activity عبر Shared/SunnahPrayerDeepLink.
typealias PrayerWidgetDeepLink = SunnahPrayerDeepLink

private let widgetLog = Logger(subsystem: "com.yousef.majlisilm", category: "PrayerWidget")

enum PrayerSlotKey: String, CaseIterable {
    case fajr, sunrise, dhuhr, asr, maghrib, isha

    var nameAr: String {
        switch self {
        case .fajr: return "الفجر"
        case .sunrise: return "الشروق"
        case .dhuhr: return "الظهر"
        case .asr: return "العصر"
        case .maghrib: return "المغرب"
        case .isha: return "العشاء"
        }
    }

    var symbolName: String {
        switch self {
        case .fajr: return "moon.stars.fill"
        case .sunrise: return "sunrise.fill"
        case .dhuhr: return "sun.max.fill"
        case .asr: return "sun.haze.fill"
        case .maghrib: return "sunset.fill"
        case .isha: return "moon.fill"
        }
    }

    var isObligatory: Bool { self != .sunrise }
}

enum SunnahWidgetPresentation: String {
    case placeholder
    case galleryPreview
    case liveValid
    case liveNoData
    case liveStale
    case liveMalformed
    case appInitializationRequired
    case permissionRequired
    case configurationRequired
}

struct PrayerTimelineSlot: Hashable {
    let key: PrayerSlotKey
    let date: Date
}

struct PrayerWidgetEntry: TimelineEntry {
    let date: Date
    let snapshot: SharedPrayerSnapshot?
    let dataState: PrayerWidgetDataState
    let presentation: SunnahWidgetPresentation
    let allowsLiveCountdown: Bool
    let slots: [PrayerTimelineSlot]
    let currentKey: PrayerSlotKey?
    let currentNameAr: String?
    let previousKey: PrayerSlotKey?
    let previousNameAr: String?
    let previousDate: Date?
    let nextKey: PrayerSlotKey?
    let nextNameAr: String?
    let nextDate: Date?
    let nextHasStarted: Bool
    let locationLabel: String
    let lastUpdated: Date?
    let gregorianDateText: String
    let hijriDateText: String?
    let isSampleData: Bool

    /// Native redacted placeholder — layout shapes, not personal values.
    static func placeholder() -> PrayerWidgetEntry {
        galleryPreview(presentation: .placeholder)
    }

    /// Representative gallery/preview content — not live device data. Never written to App Group.
    static func galleryPreview(presentation: SunnahWidgetPresentation = .galleryPreview) -> PrayerWidgetEntry {
        let now = Date()
        let tz = TimeZone(identifier: "Asia/Riyadh") ?? .current
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = tz
        let dayStart = cal.startOfDay(for: now)
        func at(_ hour: Int, _ minute: Int) -> Int64 {
            let d = cal.date(byAdding: DateComponents(hour: hour, minute: minute), to: dayStart) ?? dayStart
            return Int64(d.timeIntervalSince1970 * 1000)
        }
        // Always-future next (~25m) so static gallery never collapses timerInterval / nextDate.
        let next = now.addingTimeInterval(25 * 60)
        let prev = now.addingTimeInterval(-40 * 60)
        func ms(_ date: Date) -> Int64 { Int64(date.timeIntervalSince1970 * 1000) }
        let times: [String: Int64] = [
            "fajr": at(5, 5),
            "sunrise": at(6, 20),
            "dhuhr": ms(next),
            "asr": at(15, 30),
            "maghrib": at(18, 5),
            "isha": at(19, 30),
        ]
        return make(
            date: now,
            snapshot: SharedPrayerSnapshot(
                schemaVersion: SharedPrayerSnapshot.currentSchema,
                locationLabel: "معاينة",
                timeZoneIdentifier: tz.identifier,
                dayKey: SunnahSharedStore.dayKey(for: now, timeZone: tz),
                timesEpochMs: times,
                nextPrayerKey: "dhuhr",
                nextPrayerNameAr: "الظهر",
                nextPrayerEpochMs: ms(next),
                nextHasStarted: false,
                updatedAtEpochMs: ms(now)
            ),
            isPreview: true,
            presentation: presentation,
            allowsLiveCountdown: false,
            previousOverride: (key: .fajr, date: prev)
        )
    }

    static func noDataEntry(date: Date = Date()) -> PrayerWidgetEntry {
        make(date: date, snapshot: nil, isPreview: false, presentation: .liveNoData, allowsLiveCountdown: false)
    }

    static func make(
        date: Date,
        snapshot: SharedPrayerSnapshot?,
        isPreview: Bool = false,
        presentation: SunnahWidgetPresentation? = nil,
        allowsLiveCountdown: Bool = true,
        previousOverride: (key: PrayerSlotKey, date: Date)? = nil
    ) -> PrayerWidgetEntry {
        let state = isPreview ? PrayerWidgetDataState.validData : SunnahSharedStore.classifyPrayerData(snapshot, now: date)
        let resolvedPresentation = presentation ?? Self.mapPresentation(state: state, isPreview: isPreview)
        let tz = TimeZone(identifier: snapshot?.timeZoneIdentifier ?? TimeZone.current.identifier)
            ?? .current
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = tz

        let slots: [PrayerTimelineSlot] = PrayerSlotKey.allCases.compactMap { key in
            guard let ms = snapshot?.timesEpochMs[key.rawValue] else { return nil }
            return PrayerTimelineSlot(key: key, date: Date(timeIntervalSince1970: TimeInterval(ms) / 1000))
        }.sorted { $0.date < $1.date }

        let obligatory = slots.filter { $0.key.isObligatory }

        let derivedNext = obligatory.first(where: { $0.date > date })
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

        let current = obligatory.last(where: { $0.date <= date })
        let previous: PrayerTimelineSlot? = {
            if let override = previousOverride {
                return PrayerTimelineSlot(key: override.key, date: override.date)
            }
            guard let cur = current else { return nil }
            return obligatory.last(where: { $0.date < cur.date }) ?? obligatory.last(where: { $0.key != cur.key && $0.date <= date })
        }()

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
            presentation: resolvedPresentation,
            allowsLiveCountdown: allowsLiveCountdown && !isPreview && state == .validData,
            slots: slots,
            currentKey: current?.key,
            currentNameAr: current?.key.nameAr,
            previousKey: previous?.key,
            previousNameAr: previous?.key.nameAr,
            previousDate: previous?.date,
            nextKey: nextKey,
            nextNameAr: nextName,
            nextDate: nextDate,
            nextHasStarted: nextHasStarted,
            locationLabel: isPreview ? "معاينة" : (snapshot?.locationLabel ?? ""),
            lastUpdated: lastUpdated,
            gregorianDateText: gregorian,
            hijriDateText: hijri,
            isSampleData: isPreview
        )
    }

    private static func mapPresentation(state: PrayerWidgetDataState, isPreview: Bool) -> SunnahWidgetPresentation {
        if isPreview { return .galleryPreview }
        switch state {
        case .validData: return .liveValid
        case .staleData: return .liveStale
        case .malformedData: return .liveMalformed
        case .noDataYet: return .liveNoData
        case .appOpenRequired: return .appInitializationRequired
        }
    }

    var needsAppOpenAction: Bool {
        switch dataState {
        case .noDataYet, .malformedData, .appOpenRequired:
            return true
        case .staleData, .validData:
            return false
        }
    }

    var isGlanceable: Bool {
        if needsAppOpenAction { return false }
        let name = nextNameAr?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if name.isEmpty || name == "—" { return false }
        if nextDate == nil && slots.isEmpty { return false }
        return true
    }

    func slot(for key: PrayerSlotKey) -> PrayerTimelineSlot? {
        slots.first(where: { $0.key == key })
    }
}

struct PrayerWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerWidgetEntry {
        .placeholder()
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerWidgetEntry) -> Void) {
        if context.isPreview {
            completion(.galleryPreview())
            return
        }
        // Keep loadPrayer() on the snapshot path for the data-contract gate.
        let legacy = SunnahSharedStore.loadPrayer()
        let snapshot = SunnahSharedStore.loadCanonicalPrayer() ?? legacy
        let live = PrayerWidgetEntry.make(date: Date(), snapshot: snapshot, allowsLiveCountdown: false)
        if live.isGlanceable {
            completion(live)
        } else {
            completion(.galleryPreview())
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerWidgetEntry>) -> Void) {
        let snapshot = SunnahSharedStore.loadCanonicalPrayer() ?? SunnahSharedStore.loadPrayer()
        let now = Date()
        let entry = PrayerWidgetEntry.make(date: now, snapshot: snapshot)
        #if DEBUG
        widgetLog.debug("timeline generated state=\(entry.dataState.rawValue, privacy: .public) slots=\(entry.slots.count)")
        #endif

        var dates: [Date] = [now]
        if let next = entry.nextDate, next > now {
            dates.append(next)
            let pre = next.addingTimeInterval(-15 * 60)
            if pre > now { dates.append(pre) }
        }
        for slot in entry.slots where slot.date > now {
            dates.append(slot.date)
        }
        var cal = Calendar.current
        if let tz = TimeZone(identifier: snapshot?.timeZoneIdentifier ?? "") {
            cal.timeZone = tz
        }
        if let midnight = cal.nextDate(after: now, matching: DateComponents(hour: 0, minute: 0), matchingPolicy: .nextTime) {
            dates.append(midnight)
        }
        let unique = Array(Set(dates)).sorted()
        let entries = unique.prefix(8).map { PrayerWidgetEntry.make(date: $0, snapshot: snapshot) }

        let policy: TimelineReloadPolicy
        if let next = entry.nextDate, next > now {
            policy = .after(next)
        } else if entry.needsAppOpenAction {
            policy = .after(now.addingTimeInterval(15 * 60))
        } else {
            policy = .after(now.addingTimeInterval(30 * 60))
        }
        completion(Timeline(entries: entries.isEmpty ? [entry] : Array(entries), policy: policy))
    }
}

enum SunnahWidgetTimeFormatting {
    static func staticRemaining(from: Date, to: Date) -> String {
        let sec = max(0, Int(to.timeIntervalSince(from)))
        let minutes = sec / 60
        let hours = minutes / 60
        let rem = minutes % 60
        if hours > 0 {
            return "\(arabic(hours)) س \(arabic(rem)) د"
        }
        return "\(arabic(minutes)) د"
    }

    static func clock(_ date: Date, timeZone: TimeZone = .current) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ar")
        f.timeZone = timeZone
        f.timeStyle = .short
        f.dateStyle = .none
        return f.string(from: date)
    }

    static func arabic(_ value: Int) -> String {
        let map: [Character] = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
        return String(String(value).map { ch -> Character in
            guard let d = ch.wholeNumberValue, d >= 0, d <= 9 else { return ch }
            return map[d]
        })
    }
}
