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
