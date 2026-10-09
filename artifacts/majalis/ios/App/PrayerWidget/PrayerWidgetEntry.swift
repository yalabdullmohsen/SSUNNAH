import Foundation
import SunnahWidgetKit
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
    /// «مضى على الأذان»: الصلاة التي دخل وقتها وحدود نافذتها (nil خارج النافذة)
    let elapsedKey: PrayerSlotKey?
    let elapsedStart: Date?
    let elapsedEnd: Date?
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
        guard let day = GalleryPrayer.day(now: now) else { return noDataEntry(date: now) }
        return make(
            date: now,
            snapshot: SharedPrayerSnapshot(
                schemaVersion: SharedPrayerSnapshot.currentSchema,
                locationLabel: day.label,
                timeZoneIdentifier: day.timeZoneIdentifier,
                dayKey: day.dayKey,
                timesEpochMs: day.timesEpochMs,
                nextPrayerKey: day.nextKey,
                nextPrayerNameAr: day.nextNameAr,
                nextPrayerEpochMs: day.nextEpochMs,
                nextHasStarted: false,
                updatedAtEpochMs: Int64(now.timeIntervalSince1970 * 1000)
            ),
            isPreview: true,
            presentation: presentation,
            allowsLiveCountdown: false
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

        let todayKey = SunnahSharedStore.dayKey(for: date, timeZone: tz)
        // Displayed day: the published day, or an engine-computed upcoming day once midnight passes.
        let dayTimes: [String: Int64] = {
            guard let snapshot else { return [:] }
            if snapshot.dayKey != todayKey,
               let rolled = snapshot.upcomingDays?.first(where: { $0.dayKey == todayKey }) {
                return rolled.timesEpochMs
            }
            return snapshot.timesEpochMs
        }()
        func slotsFrom(_ times: [String: Int64]) -> [PrayerTimelineSlot] {
            PrayerSlotKey.allCases.compactMap { key in
                guard let ms = times[key.rawValue] else { return nil }
                return PrayerTimelineSlot(key: key, date: Date(timeIntervalSince1970: TimeInterval(ms) / 1000))
            }
        }
        let slots = slotsFrom(dayTimes).sorted { $0.date < $1.date }

        // Every known obligatory boundary (published day + upcoming days) — drives
        // previous/current/next across Isha → next-day Fajr without an app open.
        let obligatory: [PrayerTimelineSlot] = {
            var all = slotsFrom(snapshot?.timesEpochMs ?? [:])
            for day in snapshot?.upcomingDays ?? [] { all.append(contentsOf: slotsFrom(day.timesEpochMs)) }
            all.append(contentsOf: slots)
            return Array(Set(all.filter { $0.key.isObligatory })).sorted { $0.date < $1.date }
        }()

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

        let current = obligatory.last(where: { $0.date <= date }) ?? {
            guard let raw = snapshot?.currentPrayerKey?.lowercased(),
                  let key = PrayerSlotKey(rawValue: raw),
                  let ms = snapshot?.currentPrayerStartedAtEpochMs
            else { return nil }
            let started = Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
            return started <= date ? PrayerTimelineSlot(key: key, date: started) : nil
        }()
        let previous: PrayerTimelineSlot? = {
            if let override = previousOverride {
                return PrayerTimelineSlot(key: override.key, date: override.date)
            }
            // Derive from boundaries first: published previous* is only true at publish time.
            if let cur = current, let derived = obligatory.last(where: { $0.date < cur.date }) {
                return derived
            }
            if let raw = snapshot?.previousPrayerKey?.lowercased(),
               let key = PrayerSlotKey(rawValue: raw),
               let ms = snapshot?.previousPrayerEpochMs {
                let at = Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
                if at <= date, current.map({ at < $0.date }) ?? true {
                    return PrayerTimelineSlot(key: key, date: at)
                }
            }
            return nil
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

        let elapsedPhase = state == .validData
            ? PrayerElapsedPhase.window(
                adhan: current?.date,
                now: date,
                windowMinutes: PrayerElapsedPhase.windowMinutes(snapshot)
            )
            : nil
        let elapsedKey: PrayerSlotKey? = elapsedPhase == nil ? nil : current?.key

        let lastUpdated: Date? = {
            guard let ms = snapshot?.updatedAtEpochMs, ms > 0 else { return nil }
            return Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
        }()

        let gregorian: String = {
            let f = DateFormatter()
            f.calendar = cal
            f.locale = WidgetFormat.locale
            f.timeZone = tz
            f.dateStyle = .medium
            f.timeStyle = .none
            return f.string(from: date)
        }()

        let hijri: String? = {
            var islamic = Calendar(identifier: .islamicUmmAlQura)
            islamic.locale = WidgetFormat.locale
            islamic.timeZone = tz
            let f = DateFormatter()
            f.calendar = islamic
            f.locale = WidgetFormat.locale
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
            elapsedKey: elapsedKey,
            elapsedStart: elapsedPhase?.start,
            elapsedEnd: elapsedPhase?.end,
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
        case .permissionRequired: return .permissionRequired
        }
    }

    var needsAppOpenAction: Bool {
        switch dataState {
        case .noDataYet, .malformedData, .appOpenRequired, .permissionRequired:
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

    /// اسم الصلاة التي مضى على أذانها (nil خارج النافذة)
    var elapsedNameAr: String? { elapsedKey?.nameAr }

    /// يُستعمل بدل «التالي X» أثناء النافذة: «مضى على أذان X»
    func nextLine(_ prefix: String) -> String? {
        if let name = elapsedNameAr { return "مضى على أذان \(name)" }
        return nextNameAr.map { "\(prefix) \($0)" }
    }

    /// عنوان صغير فوق اسم الصلاة: «مضى على أذان» أثناء النافذة وإلا الأصل («التالي»/«التالية»)
    func nextCaption(_ fallback: String) -> String {
        elapsedNameAr == nil ? fallback : "مضى على أذان"
    }

    /// اسم الصلاة المعروض: التي مضى على أذانها أثناء النافذة وإلا التالية
    var nextDisplayName: String? { elapsedNameAr ?? nextNameAr }

    /// وضع العدّ الحي الموحّد: تصاعدي في نافذة الأذان وإلا تنازلي حتى التالية.
    var clockMode: LiveClock.Mode {
        LiveClock.resolve(now: date, elapsedStart: elapsedStart, nextDate: nextDate, nextHasStarted: nextHasStarted)
    }

    var currentStartDate: Date? {
        guard let key = currentKey else { return nil }
        return slot(for: key)?.date
    }
}

/// Timeline boundaries: now, 15m pre-alert, every known prayer boundary (published day +
/// engine upcoming days, so after Isha → next-day Fajr), and local midnight (Hijri/Gregorian rollover).
enum PrayerWidgetTimelinePolicy {
    static let horizon: TimeInterval = 26 * 3600
    static let maxEntries = 16

    static func entryDates(now: Date, entry: PrayerWidgetEntry, snapshot: SharedPrayerSnapshot?) -> [Date] {
        var dates: [Date] = [now]
        if let next = entry.nextDate, next > now {
            dates.append(next)
            let pre = next.addingTimeInterval(-15 * 60)
            if pre > now { dates.append(pre) }
        }
        var boundaries: [Int64] = snapshot.map { Array($0.timesEpochMs.values) } ?? []
        for day in snapshot?.upcomingDays ?? [] { boundaries.append(contentsOf: day.timesEpochMs.values) }
        for ms in boundaries {
            let d = Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
            if d > now, d.timeIntervalSince(now) <= horizon { dates.append(d) }
        }
        // نهاية نافذة «مضى على الأذان» لكل فرض (adhan + نافذة): لحظة العودة للعدّ التنازلي
        var obligatoryTimes: [Int64] = (snapshot?.timesEpochMs ?? [:]).filter { $0.key != "sunrise" }.map { $0.value }
        for day in snapshot?.upcomingDays ?? [] {
            obligatoryTimes.append(contentsOf: day.timesEpochMs.filter { $0.key != "sunrise" }.map { $0.value })
        }
        let windowSec = TimeInterval(PrayerElapsedPhase.windowMinutes(snapshot) * 60)
        for ms in obligatoryTimes {
            let end = Date(timeIntervalSince1970: TimeInterval(ms) / 1000).addingTimeInterval(windowSec)
            if end > now, end.timeIntervalSince(now) <= horizon { dates.append(end) }
        }
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(identifier: snapshot?.timeZoneIdentifier ?? "") ?? .current
        if let midnight = cal.nextDate(after: now, matching: DateComponents(hour: 0, minute: 0), matchingPolicy: .nextTime) {
            dates.append(midnight)
        }
        return Array(Array(Set(dates)).sorted().prefix(maxEntries))
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

        let entries = PrayerWidgetTimelinePolicy.entryDates(now: now, entry: entry, snapshot: snapshot)
            .map { PrayerWidgetEntry.make(date: $0, snapshot: snapshot) }

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
    static func clock(_ date: Date, timeZone: TimeZone = .current) -> String {
        WidgetFormat.time(date, timeZone: timeZone)
    }

    static func arabic(_ value: Int) -> String {
        WidgetFormat.digits(value)
    }
}
