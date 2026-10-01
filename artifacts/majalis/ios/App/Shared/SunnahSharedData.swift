import Foundation

/// App Group canonical id — Main App · PrayerLiveActivity · future Widget/Watch.
/// Portal registration = OWNER_ACTION; repo prepares entitlements only.
enum SunnahAppGroup {
    static let identifier = "group.com.yousef.majlisilm"

    /// UserDefaults suite for non-secret shared snapshots only.
    static var defaults: UserDefaults? {
        UserDefaults(suiteName: identifier)
    }
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

/// Single owner for App Group read/write. Never stores auth/secrets.
enum SunnahSharedStore {
    static let schemaVersion = 1

    @discardableResult
    static func publishPrayer(_ snapshot: SharedPrayerSnapshot) -> Bool {
        writeCodable(snapshot, key: SunnahSharedKeys.prayerSnapshot)
    }

    @discardableResult
    static func publishProgress(_ snapshot: SharedProgressSnapshot) -> Bool {
        writeCodable(snapshot, key: SunnahSharedKeys.progressSnapshot)
    }

    static func loadPrayer() -> SharedPrayerSnapshot? {
        readCodable(SharedPrayerSnapshot.self, key: SunnahSharedKeys.prayerSnapshot)
    }

    static func loadProgress() -> SharedProgressSnapshot? {
        readCodable(SharedProgressSnapshot.self, key: SunnahSharedKeys.progressSnapshot)
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
            return true
        } catch {
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
