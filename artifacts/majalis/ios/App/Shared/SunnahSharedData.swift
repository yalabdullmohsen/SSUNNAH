import Foundation
import os

/// App Group canonical id — Main App · PrayerLiveActivity · PrayerWidget · future Watch.
/// Portal registration = OWNER_ACTION; repo prepares entitlements only.
enum SunnahAppGroup {
    static let identifier = "group.com.yousef.majlisilm"

    /// UserDefaults suite for non-secret shared snapshots only.
    static var defaults: UserDefaults? {
        UserDefaults(suiteName: identifier)
    }
}

/// WidgetKit kind strings — must match JS `SUNNAH_PRAYER_WIDGET_KIND` and catalog kinds.
enum SunnahWidgetKind {
    static let prayerTimes = "PrayerTimesWidget"
    static let prayerCurrent = "sunnah.widget.prayer.current"
    static let prayerNext = "sunnah.widget.prayer.next"
    static let prayerPrevious = "sunnah.widget.prayer.previous"
    static let prayerPreviousNext = "sunnah.widget.prayer.previous-next"
    static let prayerMorning = "sunnah.widget.prayer.morning"
    static let prayerEvening = "sunnah.widget.prayer.evening"
    static let prayerAll = "sunnah.widget.prayer.all"
    static let prayerHijri = "sunnah.widget.prayer.hijri"
    static let calendarHijri = "sunnah.widget.calendar.hijri"
    static let calendarDual = "sunnah.widget.calendar.dual"
    static let calendarToday = "sunnah.widget.calendar.today"
    static let calendarRamadan = "sunnah.widget.calendar.ramadan"
    static let calendarEvent = "sunnah.widget.calendar.event"
    static let adhkarMorning = "sunnah.widget.adhkar.morning"
    static let adhkarEvening = "sunnah.widget.adhkar.evening"
    static let adhkarTimeAware = "sunnah.widget.adhkar.time-aware"
    static let adhkarRotating = "sunnah.widget.adhkar.rotating"
    static let adhkarStreak = "sunnah.widget.adhkar.streak"
    static let custom = "sunnah.widget.custom"
    static let quranAyah = "sunnah.widget.quran.ayah"
    static let quranGoal = "sunnah.widget.quran.goal"
    static let mushafContinue = "sunnah.widget.mushaf.continue"
    static let mushafBookmark = "sunnah.widget.mushaf.bookmark"
    static let mushafProgress = "sunnah.widget.mushaf.progress"
    static let mushafQuickOpen = "sunnah.widget.mushaf.quick-open"
    static let contentHadith = "sunnah.widget.content.hadith"
    static let contentFaidah = "sunnah.widget.content.faidah"
    static let contentDua = "sunnah.widget.content.dua"
    static let homeToday = "sunnah.widget.home.today"
    static let homeActions = "sunnah.widget.home.actions"
    static let homeSpiritual = "sunnah.widget.home.spiritual"

    static let prayerFamily: [String] = [
        prayerTimes, prayerCurrent, prayerNext, prayerPrevious, prayerPreviousNext,
        prayerMorning, prayerEvening, prayerAll, prayerHijri,
    ]
    static let calendarFamily: [String] = [
        calendarHijri, calendarDual, calendarToday, calendarRamadan, calendarEvent,
    ]
    static let adhkarFamily: [String] = [
        adhkarMorning, adhkarEvening, adhkarTimeAware, adhkarRotating, adhkarStreak,
    ]
    static let quranFamily: [String] = [quranAyah, quranGoal]
    static let mushafFamily: [String] = [mushafContinue, mushafBookmark, mushafProgress, mushafQuickOpen]
    static let customFamily: [String] = [custom, contentHadith, contentFaidah, contentDua]
    static let homeFamily: [String] = [homeToday, homeActions, homeSpiritual]

    static let allUnique: [String] = prayerFamily + calendarFamily + adhkarFamily + customFamily + quranFamily + mushafFamily + homeFamily
}

/// Keys allowed in the App Group suite. Anything else is rejected.
enum SunnahSharedKeys {
    static let prayerSnapshot = "sunnah.shared.prayer.v1"
    static let progressSnapshot = "sunnah.shared.progress.v1"
    static let envelope = "sunnah.shared.envelope.v1"
    static let schemaVersion = "sunnah.shared.schemaVersion"

    static let allowed: Set<String> = [
        prayerSnapshot,
        progressSnapshot,
        envelope,
        schemaVersion,
    ]

    /// Substrings never allowed in App Group storage (token/secret leakage guard).
    static let forbiddenSubstrings: [String] = [
        // "token" / "refresh" cover auth-related key name fragments (case-insensitive).
        "token", "secret", "password", "refresh",
        "authorization", "apikey", "api_key", "bearer", "session",
        "credential", "private_key", "keychain",
    ]
}

/// Prayer times + next prayer + countdown anchors for Widget/Watch/LA readers.
struct SharedPrayerSnapshot: Codable, Hashable {
    var schemaVersion: Int
    /// ISO city/location label (display only)
    var locationLabel: String
    var timeZoneIdentifier: String
    /// Gregorian day key YYYY-MM-DD in location TZ
    var dayKey: String
    /// Epoch ms for each slot (fajr/dhuhr/asr/maghrib/isha) — missing keys omitted
    var timesEpochMs: [String: Int64]
    var nextPrayerKey: String?
    var nextPrayerNameAr: String?
    var nextPrayerEpochMs: Int64?
    /// When the next prayer has entered (countdown → "الآن")
    var nextHasStarted: Bool
    var previousPrayerKey: String? = nil
    var previousPrayerNameAr: String? = nil
    var previousPrayerEpochMs: Int64? = nil
    var currentPrayerKey: String? = nil
    var currentPrayerNameAr: String? = nil
    var currentPrayerStartedAtEpochMs: Int64? = nil
    var nextTransitionAtEpochMs: Int64? = nil
    var calculationDate: String? = nil
    var calculationMethodIdentifier: String? = nil
    var permissionState: String? = nil
    var initializationState: String? = nil
    var updatedAtEpochMs: Int64
    /// Engine-computed obligatory times for the following days (tomorrow, after) —
    /// lets the widget roll after Isha → next-day Fajr and across midnight without an app open.
    var upcomingDays: [SharedPrayerDay]? = nil

    static let currentSchema = 1
}

/// One calendar day of engine prayer times (epoch ms keyed by lowercase slot).
struct SharedPrayerDay: Codable, Hashable {
    var dayKey: String
    var timesEpochMs: [String: Int64]
}

/// Non-sensitive progress counters for future Widget/Watch surfaces.
struct SharedProgressSnapshot: Codable, Hashable {
    var schemaVersion: Int
    var dailyWirdCompleted: Int
    var dailyWirdTarget: Int
    var mushafPagesReadToday: Int
    var updatedAtEpochMs: Int64

    static let currentSchema = 1
}

/// Actionable reader states — never render a permanent unexplained dash when one of these applies.
enum PrayerWidgetDataState: String {
    case noDataYet
    case malformedData
    case staleData
    case validData
    case appOpenRequired
    case permissionRequired
}

/// Single owner for App Group read/write. Never stores auth/secrets.
enum SunnahSharedStore {
    static let schemaVersion = 1
    private static let log = Logger(subsystem: "com.yousef.majlisilm", category: "SunnahSharedStore")
    /// Snapshots older than this are treated as stale (reader may still show last known times).
    static let staleAfterSeconds: TimeInterval = 36 * 3600

    @discardableResult
    static func publishPrayer(_ snapshot: SharedPrayerSnapshot) -> Bool {
        #if DEBUG
        log.debug("write attempted schema=\(snapshot.schemaVersion) day=\(snapshot.dayKey, privacy: .public)")
        #endif
        let ok = writeCodable(snapshot, key: SunnahSharedKeys.prayerSnapshot)
        #if DEBUG
        if ok {
            log.debug("write succeeded key=\(SunnahSharedKeys.prayerSnapshot, privacy: .public) updatedAt=\(snapshot.updatedAtEpochMs)")
        } else {
            log.error("write failed key=\(SunnahSharedKeys.prayerSnapshot, privacy: .public) suiteAvailable=\(SunnahAppGroup.defaults != nil)")
        }
        #endif
        return ok
    }

    @discardableResult
    static func publishProgress(_ snapshot: SharedProgressSnapshot) -> Bool {
        writeCodable(snapshot, key: SunnahSharedKeys.progressSnapshot)
    }

    static func loadPrayer() -> SharedPrayerSnapshot? {
        guard let defaults = SunnahAppGroup.defaults else {
            #if DEBUG
            log.error("read failed — App Group suite unavailable")
            #endif
            return nil
        }
        guard let data = defaults.data(forKey: SunnahSharedKeys.prayerSnapshot) else {
            #if DEBUG
            log.debug("read — no prayer payload")
            #endif
            return nil
        }
        do {
            let snap = try JSONDecoder().decode(SharedPrayerSnapshot.self, from: data)
            #if DEBUG
            log.debug("read succeeded schema=\(snap.schemaVersion) day=\(snap.dayKey, privacy: .public)")
            #endif
            return snap
        } catch {
            #if DEBUG
            log.error("decode failed class=\(String(describing: type(of: error)), privacy: .public)")
            #endif
            return nil
        }
    }

    static func loadProgress() -> SharedProgressSnapshot? {
        readCodable(SharedProgressSnapshot.self, key: SunnahSharedKeys.progressSnapshot)
    }

    @discardableResult
    static func publishEnvelope(_ envelope: SunnahWidgetEnvelope) -> Bool {
        writeCodable(envelope, key: SunnahSharedKeys.envelope)
    }

    static func loadEnvelope() -> SunnahWidgetEnvelope? {
        guard let defaults = SunnahAppGroup.defaults else { return nil }
        guard let data = defaults.data(forKey: SunnahSharedKeys.envelope) else { return nil }
        return SunnahWidgetEnvelopeCodec.decodeIsolated(from: data)
    }

    /// Prayer payload: the freshest of envelope isolation and legacy prayer.v1
    /// (a later envelope publish without prayer must never resurrect an older snapshot).
    static func loadCanonicalPrayer() -> SharedPrayerSnapshot? {
        let envelopePrayer = loadEnvelope()?.prayerPayload
        let legacy = loadPrayer()
        switch (envelopePrayer, legacy) {
        case let (env?, leg?):
            return leg.updatedAtEpochMs > env.updatedAtEpochMs ? leg : env
        case let (env?, nil):
            return env
        default:
            return legacy
        }
    }

    static func classifyPrayerData(_ snapshot: SharedPrayerSnapshot?, now: Date = Date()) -> PrayerWidgetDataState {
        guard let snapshot else { return .noDataYet }
        // Future schema versions fail closed for this domain; other envelope domains stay available.
        if snapshot.schemaVersion < 1 || snapshot.schemaVersion > SharedPrayerSnapshot.currentSchema {
            return .malformedData
        }
        let permission = (snapshot.permissionState ?? "").lowercased()
        if permission == "denied"
            || permission == "requires_permission"
            || permission == "revoked" {
            return .permissionRequired
        }
        if snapshot.timesEpochMs.isEmpty && snapshot.nextPrayerEpochMs == nil {
            return .appOpenRequired
        }
        if let initState = snapshot.initializationState?.uppercased(),
           initState == "REQUIRES_INITIALIZATION" {
            return .appOpenRequired
        }
        if snapshot.updatedAtEpochMs > 0 {
            let updated = Date(timeIntervalSince1970: TimeInterval(snapshot.updatedAtEpochMs) / 1000)
            if now.timeIntervalSince(updated) > staleAfterSeconds {
                #if DEBUG
                log.debug("stale payload detected ageSeconds=\(Int(now.timeIntervalSince(updated)))")
                #endif
                return .staleData
            }
        }
        // Expired next-prayer without a future slot must never drive a live countdown.
        if let nextMs = snapshot.nextPrayerEpochMs,
           nextMs > 0,
           Date(timeIntervalSince1970: TimeInterval(nextMs) / 1000) <= now,
           snapshot.timesEpochMs.isEmpty {
            return .staleData
        }
        return .validData
    }

    /// Publish LA-aligned next-prayer fields without wiping day times if already present.
    @discardableResult
    static func publishLiveActivityState(
        prayerKey: String,
        prayerNameAr: String,
        prayerTime: Date,
        locationLabel: String,
        hasStarted: Bool
    ) -> Bool {
        var snap = loadPrayer() ?? SharedPrayerSnapshot(
            schemaVersion: SharedPrayerSnapshot.currentSchema,
            locationLabel: locationLabel,
            timeZoneIdentifier: TimeZone.current.identifier,
            dayKey: Self.dayKey(for: Date(), timeZone: TimeZone.current),
            timesEpochMs: [:],
            nextPrayerKey: nil,
            nextPrayerNameAr: nil,
            nextPrayerEpochMs: nil,
            nextHasStarted: false,
            updatedAtEpochMs: 0
        )
        snap.schemaVersion = SharedPrayerSnapshot.currentSchema
        snap.locationLabel = locationLabel
        snap.nextPrayerKey = prayerKey
        snap.nextPrayerNameAr = prayerNameAr
        snap.nextPrayerEpochMs = Int64(prayerTime.timeIntervalSince1970 * 1000)
        snap.nextHasStarted = hasStarted
        snap.updatedAtEpochMs = Int64(Date().timeIntervalSince1970 * 1000)
        var times = snap.timesEpochMs
        times[prayerKey.lowercased()] = snap.nextPrayerEpochMs
        snap.timesEpochMs = times
        return publishPrayer(snap)
    }

    private static func writeCodable<T: Encodable>(_ value: T, key: String) -> Bool {
        guard SunnahSharedKeys.allowed.contains(key) else { return false }
        guard !isForbiddenKey(key) else { return false }
        guard let defaults = SunnahAppGroup.defaults else { return false }
        do {
            let data = try JSONEncoder().encode(value)
            defaults.set(data, forKey: key)
            defaults.set(schemaVersion, forKey: SunnahSharedKeys.schemaVersion)
            // Ensure App Group suite is flushed before WidgetKit reload in the extension process.
            defaults.synchronize()
            return true
        } catch {
            #if DEBUG
            log.error("encode failed class=\(String(describing: type(of: error)), privacy: .public)")
            #endif
            return false
        }
    }

    private static func readCodable<T: Decodable>(_ type: T.Type, key: String) -> T? {
        guard let defaults = SunnahAppGroup.defaults,
              let data = defaults.data(forKey: key)
        else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }

    static func isForbiddenKey(_ key: String) -> Bool {
        let lower = key.lowercased()
        return SunnahSharedKeys.forbiddenSubstrings.contains { lower.contains($0.lowercased()) }
            && !SunnahSharedKeys.allowed.contains(key)
    }

    static func dayKey(for date: Date, timeZone: TimeZone) -> String {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        let c = cal.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }
}
