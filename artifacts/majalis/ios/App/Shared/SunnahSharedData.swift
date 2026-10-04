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

/// WidgetKit kind strings — must match JS `SUNNAH_PRAYER_WIDGET_KIND` and `PrayerTimesWidget.kind`.
enum SunnahWidgetKind {
    static let prayerTimes = "PrayerTimesWidget"
}

/// Keys allowed in the App Group suite. Anything else is rejected.
enum SunnahSharedKeys {
    static let prayerSnapshot = "sunnah.shared.prayer.v1"
    static let progressSnapshot = "sunnah.shared.progress.v1"
    static let schemaVersion = "sunnah.shared.schemaVersion"

    static let allowed: Set<String> = [
        prayerSnapshot,
        progressSnapshot,
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
    var updatedAtEpochMs: Int64

    static let currentSchema = 1
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

    static func classifyPrayerData(_ snapshot: SharedPrayerSnapshot?, now: Date = Date()) -> PrayerWidgetDataState {
        guard let snapshot else { return .noDataYet }
        if snapshot.schemaVersion < 1 {
            return .malformedData
        }
        if snapshot.timesEpochMs.isEmpty && snapshot.nextPrayerEpochMs == nil {
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
