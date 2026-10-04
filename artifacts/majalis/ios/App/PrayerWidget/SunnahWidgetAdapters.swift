import Foundation

/// Domain adapters — read canonical App Group payloads. No calculation engines.
enum PrayerWidgetAdapter {
    static func snapshot() -> SharedPrayerSnapshot? {
        SunnahSharedStore.loadCanonicalPrayer() ?? SunnahSharedStore.loadPrayer()
    }
}

enum CalendarWidgetAdapter {
    static func payload() -> SharedCalendarPayload? {
        SunnahSharedStore.loadEnvelope()?.calendarPayload
    }
}

enum AdhkarWidgetAdapter {
    static func payload() -> SharedAdhkarPayload? {
        SunnahSharedStore.loadEnvelope()?.adhkarPayload
    }
}

enum QuranWidgetAdapter {
    static func payload() -> SharedQuranPayload? {
        SunnahSharedStore.loadEnvelope()?.quranPayload
    }
}

enum MushafWidgetAdapter {
    static func payload() -> SharedMushafPayload? {
        SunnahSharedStore.loadEnvelope()?.mushafPayload
    }
}

enum CustomContentWidgetAdapter {
    static func payload() -> SharedCustomContentPayload? {
        SunnahSharedStore.loadEnvelope()?.customContentPayload
    }

    static func item(id: String?) -> SharedCustomContentItem? {
        guard let id else { return payload()?.items.first }
        return payload()?.items.first(where: { $0.id == id })
    }

    /// Missing/deleted selection → configuration required (never invent content).
    static func presentation(forSelectedId id: String?) -> SunnahWidgetPresentation {
        guard let id, !id.isEmpty else { return .configurationRequired }
        if item(id: id) == nil { return .configurationRequired }
        return .liveValid
    }
}

enum MushafWidgetAdapterTruth {
    static func bookmarkConfigurationRequired(_ payload: SharedMushafPayload?) -> Bool {
        guard let payload else { return false }
        if let status = mirrorValidation(payload), status == "REQUIRES_CONFIGURATION" {
            return true
        }
        return false
    }

    private static func mirrorValidation(_ payload: SharedMushafPayload) -> String? {
        // MushafPayload does not carry validationStatus in Codable fields used by Build 55;
        // configuration is inferred when a selected bookmark was cleared server-side.
        if payload.hasBookmark == false && payload.bookmarkPage == nil && payload.lastPage == nil {
            return "REQUIRES_CONFIGURATION"
        }
        return nil
    }
}

enum HomeProgressWidgetAdapter {
    static func payload() -> SharedHomeProgressPayload? {
        SunnahSharedStore.loadEnvelope()?.progressPayload
    }
}

enum ContentSpotlightWidgetAdapter {
    static func payload() -> SharedContentSpotlightPayload? {
        SunnahSharedStore.loadEnvelope()?.contentSpotlightPayload
    }
}
