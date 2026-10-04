import Foundation
import os

/// Versioned App Group envelope. Each domain payload decodes independently.
/// A malformed Quran payload must not break Prayer widgets.
struct SunnahWidgetEnvelope: Codable, Hashable {
    var schemaVersion: Int
    var payloadId: String?
    var generatedAtEpochMs: Int64
    var expiresAtEpochMs: Int64?
    var timezoneIdentifier: String
    var localeIdentifier: String
    var calendarAuthority: String?
    var dataVersion: String?
    var publicationReason: String?
    var publicationStatus: String?
    var prayerPayload: SharedPrayerSnapshot?
    var calendarPayload: SharedCalendarPayload?
    var adhkarPayload: SharedAdhkarPayload?
    var quranPayload: SharedQuranPayload?
    var mushafPayload: SharedMushafPayload?
    var customContentPayload: SharedCustomContentPayload?
    var preferencesPayload: SharedWidgetPreferencesPayload?
    var progressPayload: SharedHomeProgressPayload?
    var contentSpotlightPayload: SharedContentSpotlightPayload?
    var islamicEventsPayload: SharedIslamicEventsPayload?
    var hadithPayload: SharedHadithPayload?
    var duaPayload: SharedDuaPayload?
    var diagnosticsPayload: SharedWidgetDiagnosticsPayload?

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
    var upcomingEventConfirmation: String?
    var upcomingEventAuthority: String?
    var gregorianDate: String?
    var gregorianDay: Int?
    var gregorianMonth: Int?
    var gregorianYear: Int?
    var gregorianWeekday: String?
    var hijriDate: String?
    var hijriWeekday: String?
    var displayDateArabic: String?
    var calendarMode: String?
    var calendarAuthority: String?
    var dayStartsAt: String?
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
    var timeWindows: [String]?
    var licenseStatus: String?
    var widgetEligible: Bool?
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
    var textSourceVersion: String?
    var licenseStatus: String?
    var widgetEligible: Bool?
    var reviewStatus: String?
    var ayahWidgetMode: String?
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
    var progressSource: String?
    var syncState: String?
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
    var calendarMode: String?
    var prayerDisplayMode: String?
    var showLocationLabel: Bool?
    var showHijriDate: Bool?
    var showGregorianDate: Bool?
    var privacyDisplayLevel: String?
    var ayahWidgetMode: String?
    var updatedAtEpochMs: Int64
    static let currentSchema = 1
}

struct SharedIslamicEventsPayload: Codable, Hashable {
    var schemaVersion: Int
    var domainVersion: Int?
    var generatedAtEpochMs: Int64?
    var expiresAtEpochMs: Int64?
    var sourceAuthority: String?
    var validationStatus: String?
    var upcomingEventId: String?
    var updatedAtEpochMs: Int64?
    static let currentSchema = 1
}

struct SharedHadithPayload: Codable, Hashable {
    var schemaVersion: Int
    var shortText: String?
    var source: String?
    var grade: String?
    var narrator: String?
    var deepLinkPath: String?
    var widgetEligible: Bool?
    var validationStatus: String?
}

struct SharedDuaPayload: Codable, Hashable {
    var schemaVersion: Int
    var title: String?
    var completeShortText: String?
    var source: String?
    var category: String?
    var deepLinkPath: String?
    var widgetEligible: Bool?
    var validationStatus: String?
}

struct SharedWidgetDiagnosticsPayload: Codable, Hashable {
    var schemaVersion: Int
    var generatedAtEpochMs: Int64?
    var sourceAuthority: String?
    var validationStatus: String?
    var futureBinaryRequired: Bool?
    var publicationStatus: String?
    var staleDomains: [String]?
    var missingSetup: [String]?
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
        func decodeDomain<T: Decodable>(_ key: String, as type: T.Type, maxSchema: Int) -> T? {
            guard let nested = obj[key], !(nested is NSNull) else { return nil }
            guard JSONSerialization.isValidJSONObject(nested) else { return nil }
            // Future domain schema fails safely for this domain only.
            if let nestedObj = nested as? [String: Any] {
                let sv: Int? = {
                    if let n = nestedObj["schemaVersion"] as? Int { return n }
                    if let n = nestedObj["schemaVersion"] as? NSNumber { return n.intValue }
                    return nil
                }()
                if let sv, sv > maxSchema {
                    #if DEBUG
                    log.error("domain future schema isolated key=\(key, privacy: .public) schema=\(sv)")
                    #endif
                    return nil
                }
            }
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
            payloadId: obj["payloadId"] as? String,
            generatedAtEpochMs: int64Val("generatedAtEpochMs") ?? 0,
            expiresAtEpochMs: int64Val("expiresAtEpochMs"),
            timezoneIdentifier: str("timezoneIdentifier", fallback: TimeZone.current.identifier),
            localeIdentifier: str("localeIdentifier", fallback: "ar"),
            calendarAuthority: obj["calendarAuthority"] as? String,
            dataVersion: obj["dataVersion"] as? String,
            publicationReason: obj["publicationReason"] as? String,
            publicationStatus: obj["publicationStatus"] as? String,
            prayerPayload: decodeDomain("prayerPayload", as: SharedPrayerSnapshot.self, maxSchema: SharedPrayerSnapshot.currentSchema),
            calendarPayload: decodeDomain("calendarPayload", as: SharedCalendarPayload.self, maxSchema: SharedCalendarPayload.currentSchema),
            adhkarPayload: decodeDomain("adhkarPayload", as: SharedAdhkarPayload.self, maxSchema: SharedAdhkarPayload.currentSchema),
            quranPayload: decodeDomain("quranPayload", as: SharedQuranPayload.self, maxSchema: SharedQuranPayload.currentSchema),
            mushafPayload: decodeDomain("mushafPayload", as: SharedMushafPayload.self, maxSchema: SharedMushafPayload.currentSchema),
            customContentPayload: decodeDomain("customContentPayload", as: SharedCustomContentPayload.self, maxSchema: SharedCustomContentPayload.currentSchema),
            preferencesPayload: decodeDomain("preferencesPayload", as: SharedWidgetPreferencesPayload.self, maxSchema: SharedWidgetPreferencesPayload.currentSchema),
            progressPayload: decodeDomain("progressPayload", as: SharedHomeProgressPayload.self, maxSchema: SharedHomeProgressPayload.currentSchema),
            contentSpotlightPayload: decodeDomain("contentSpotlightPayload", as: SharedContentSpotlightPayload.self, maxSchema: SharedContentSpotlightPayload.currentSchema),
            islamicEventsPayload: decodeDomain("islamicEventsPayload", as: SharedIslamicEventsPayload.self, maxSchema: SharedIslamicEventsPayload.currentSchema),
            hadithPayload: decodeDomain("hadithPayload", as: SharedHadithPayload.self, maxSchema: 1),
            duaPayload: decodeDomain("duaPayload", as: SharedDuaPayload.self, maxSchema: 1),
            diagnosticsPayload: decodeDomain("diagnosticsPayload", as: SharedWidgetDiagnosticsPayload.self, maxSchema: 1)
        )
    }
}
