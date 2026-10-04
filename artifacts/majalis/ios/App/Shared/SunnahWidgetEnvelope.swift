import Foundation
import os

/// Versioned App Group envelope. Each domain payload decodes independently.
/// A malformed Quran payload must not break Prayer widgets.
struct SunnahWidgetEnvelope: Codable, Hashable {
    var schemaVersion: Int
    var generatedAtEpochMs: Int64
    var expiresAtEpochMs: Int64?
    var timezoneIdentifier: String
    var localeIdentifier: String
    var prayerPayload: SharedPrayerSnapshot?
    var calendarPayload: SharedCalendarPayload?
    var adhkarPayload: SharedAdhkarPayload?
    var quranPayload: SharedQuranPayload?
    var mushafPayload: SharedMushafPayload?
    var customContentPayload: SharedCustomContentPayload?
    var preferencesPayload: SharedWidgetPreferencesPayload?
    var progressPayload: SharedHomeProgressPayload?
    var contentSpotlightPayload: SharedContentSpotlightPayload?

    static let currentSchema = 1
}

struct SharedCalendarPayload: Codable, Hashable {
    var schemaVersion: Int
    var timezoneIdentifier: String
    var weekdayAr: String
    var hijriDay: Int
    var hijriMonth: Int
    var hijriMonthAr: String
    var hijriYear: Int
    var hijriDisplay: String
    var gregorianDisplay: String
    var inRamadan: Bool
    var daysUntilRamadan: Int?
    var ramadanLabelAr: String
    var upcomingEventNameAr: String?
    var upcomingEventDays: Int?
    var upcomingEventPath: String?
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

struct SharedAdhkarPayload: Codable, Hashable {
    var schemaVersion: Int
    /// Product-approved window only: morning | evening | sleep | after-salah
    var activeCollection: String
    var activeTitleAr: String
    var morningTitleAr: String
    var eveningTitleAr: String
    var morningActionAr: String
    var eveningActionAr: String
    var rotatingText: String
    var rotatingSource: String?
    var rotatingCollection: String?
    var rotationDayKey: String
    var todayCompleted: Bool?
    var streakDays: Int?
    var hasCanonicalProgress: Bool?
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

struct SharedQuranPayload: Codable, Hashable {
    var schemaVersion: Int
    var ayahText: String
    var surahNameAr: String
    var surahNumber: Int
    var ayahNumber: Int
    var page: Int?
    var deepLinkPath: String
    var pagesCompletedToday: Int?
    var dailyTarget: Int?
    var hasCanonicalGoal: Bool?
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

struct SharedMushafPayload: Codable, Hashable {
    var schemaVersion: Int
    var lastSurahNameAr: String?
    var lastSurahNumber: Int?
    var lastPage: Int?
    var lastAyahNumber: Int?
    var bookmarkSurahNameAr: String?
    var bookmarkSurahNumber: Int?
    var bookmarkPage: Int?
    var bookmarkAyahNumber: Int?
    var hasProgress: Bool
    var hasBookmark: Bool
    var journeyPercent: Int?
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

struct SharedHomeProgressPayload: Codable, Hashable {
    var schemaVersion: Int
    var hasCanonicalTracking: Bool
    var morningAdhkarDone: Bool
    var eveningAdhkarDone: Bool
    var quranDone: Bool
    var wirdDone: Bool
    var adhkarStreakDays: Int?
    var pagesCompletedToday: Int
    var dailyPageTarget: Int
    var mushafPercent: Int?
    var currentAdhkarTitleAr: String
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

struct SharedContentSpotlightPayload: Codable, Hashable {
    var schemaVersion: Int
    var hadithText: String
    var hadithSource: String?
    var hadithPath: String
    var faidahText: String
    var faidahSource: String?
    var faidahPath: String
    var duaText: String
    var duaSource: String?
    var duaPath: String
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

struct SharedCustomContentItem: Codable, Hashable, Identifiable {
    var id: String
    var contentType: String
    var titleAr: String
    var text: String
    var source: String?
    var deepLinkPath: String
}

struct SharedCustomContentPayload: Codable, Hashable {
    var schemaVersion: Int
    var items: [SharedCustomContentItem]
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

struct SharedWidgetPreferencesPayload: Codable, Hashable {
    var schemaVersion: Int
    var appearance: String
    var showSource: Bool
    var compactText: Bool
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

enum SunnahWidgetEnvelopeCodec {
    private static let log = Logger(subsystem: "com.yousef.majlisilm", category: "SunnahWidgetEnvelope")

    /// Decode envelope with isolated domain failure — never throws out.
    static func decodeIsolated(from data: Data) -> SunnahWidgetEnvelope {
        let obj = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
        func intVal(_ key: String, fallback: Int = 0) -> Int {
            if let n = obj[key] as? Int { return n }
            if let n = obj[key] as? NSNumber { return n.intValue }
            return fallback
        }
        func int64Val(_ key: String) -> Int64? {
            if let n = obj[key] as? Int64 { return n }
            if let n = obj[key] as? Int { return Int64(n) }
            if let n = obj[key] as? Double { return Int64(n) }
            if let n = obj[key] as? NSNumber { return n.int64Value }
            return nil
        }
        func str(_ key: String, fallback: String = "") -> String {
            obj[key] as? String ?? fallback
        }
        func decodeDomain<T: Decodable>(_ key: String, as type: T.Type) -> T? {
            guard let nested = obj[key], !(nested is NSNull) else { return nil }
            guard JSONSerialization.isValidJSONObject(nested) else { return nil }
            do {
                let nestedData = try JSONSerialization.data(withJSONObject: nested)
                return try JSONDecoder().decode(type, from: nestedData)
            } catch {
                #if DEBUG
                log.error("domain decode isolated failure key=\(key, privacy: .public)")
                #endif
                return nil
            }
        }
        return SunnahWidgetEnvelope(
            schemaVersion: intVal("schemaVersion", fallback: 1),
            generatedAtEpochMs: int64Val("generatedAtEpochMs") ?? 0,
            expiresAtEpochMs: int64Val("expiresAtEpochMs"),
            timezoneIdentifier: str("timezoneIdentifier", fallback: TimeZone.current.identifier),
            localeIdentifier: str("localeIdentifier", fallback: "ar"),
            prayerPayload: decodeDomain("prayerPayload", as: SharedPrayerSnapshot.self),
            calendarPayload: decodeDomain("calendarPayload", as: SharedCalendarPayload.self),
            adhkarPayload: decodeDomain("adhkarPayload", as: SharedAdhkarPayload.self),
            quranPayload: decodeDomain("quranPayload", as: SharedQuranPayload.self),
            mushafPayload: decodeDomain("mushafPayload", as: SharedMushafPayload.self),
            customContentPayload: decodeDomain("customContentPayload", as: SharedCustomContentPayload.self),
            preferencesPayload: decodeDomain("preferencesPayload", as: SharedWidgetPreferencesPayload.self),
            progressPayload: decodeDomain("progressPayload", as: SharedHomeProgressPayload.self),
            contentSpotlightPayload: decodeDomain("contentSpotlightPayload", as: SharedContentSpotlightPayload.self)
        )
    }
}
