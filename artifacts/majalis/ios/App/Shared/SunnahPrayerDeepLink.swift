import Foundation

/// Canonical destinations (do not introduce an unsupported URL scheme):
/// https://www.ssunnah.com/prayer-times
/// https://www.ssunnah.com/adhkar/morning
/// https://www.ssunnah.com/mushaf/page/{page}
enum SunnahPrayerDeepLink {
    static let origin = "https://www.ssunnah.com"
    static let prayerTimes = URL(string: "\(origin)/prayer-times")!
    static let occasions = URL(string: "\(origin)/occasions")!
    static let adhkar = URL(string: "\(origin)/adhkar")!
    static let adhkarMorning = URL(string: "\(origin)/adhkar/morning")!
    static let adhkarEvening = URL(string: "\(origin)/adhkar/evening")!
    static let adhkarSleep = URL(string: "\(origin)/adhkar/sleep")!
    static let adhkarAfterSalah = URL(string: "\(origin)/adhkar/after-salah")!
    static let mushaf = URL(string: "\(origin)/mushaf")!
    static let widgetHelp = URL(string: "\(origin)/prayer-times")!
}

enum SunnahWidgetDeepLinkFactory {
    static func url(path: String) -> URL {
        let trimmed = path.hasPrefix("/") ? path : "/\(path)"
        return URL(string: SunnahPrayerDeepLink.origin + trimmed) ?? SunnahPrayerDeepLink.widgetHelp
    }

    static func prayer() -> URL { SunnahPrayerDeepLink.prayerTimes }

    static func adhkar(collection: String) -> URL {
        switch collection {
        case "morning": return SunnahPrayerDeepLink.adhkarMorning
        case "evening": return SunnahPrayerDeepLink.adhkarEvening
        case "sleep": return SunnahPrayerDeepLink.adhkarSleep
        case "after-salah": return SunnahPrayerDeepLink.adhkarAfterSalah
        default: return SunnahPrayerDeepLink.adhkar
        }
    }

    static func mushaf(page: Int?, ayah: String? = nil) -> URL {
        guard let page, page >= 1, page <= 604 else { return SunnahPrayerDeepLink.mushaf }
        var path = "/mushaf/page/\(page)"
        if let ayah, !ayah.isEmpty {
            path += "?ayah=\(ayah)"
        }
        return url(path: path)
    }

    static func occasions() -> URL { SunnahPrayerDeepLink.occasions }
    static func widgetHelp() -> URL { SunnahPrayerDeepLink.widgetHelp }
}
