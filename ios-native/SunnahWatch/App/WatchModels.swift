import Foundation
import SunnahWidgetKit

/// حمولة المزامنة من الآيفون (WatchConnectivity). المحتوى كله من بيانات التطبيق المدمجة؛ لا نصوص مكتوبة هنا.
struct WatchPayload: Codable, Equatable {
    struct Prayer: Codable, Equatable, Identifiable {
        var key: String
        var nameAr: String
        var epochMs: Int64
        var id: String { "\(key)-\(epochMs)" }
        var date: Date { Date(timeIntervalSince1970: TimeInterval(epochMs) / 1000) }
        /// الفروض الخمسة فقط تدخل في العدّاد.
        var isFard: Bool { ["fajr", "dhuhr", "asr", "maghrib", "isha"].contains(key) }
    }
    struct Dhikr: Codable, Equatable, Identifiable {
        var id: String
        var text: String
        var count: Int
        var source: String?
    }
    struct AdhkarSet: Codable, Equatable, Identifiable {
        var id: String            // morning | evening
        var titleAr: String
        var items: [Dhikr]
    }
    struct Spotlight: Codable, Equatable {
        var text: String
        var source: String?
    }

    var generatedAtEpochMs: Int64
    var timeZoneIdentifier: String
    var locationLabel: String
    var latitude: Double?
    var longitude: Double?
    /// فروض اليوم + أذانات الأيام التالية (لتغطية الفجر بعد العشاء).
    var prayers: [Prayer]
    var elapsedWindowMinutes: Int?
    var hijriDisplay: String?
    var adhkar: [AdhkarSet]
    var ayahOfDay: Spotlight?
    var duaOfDay: Spotlight?

    var timeZone: TimeZone { TimeZone(identifier: timeZoneIdentifier) ?? .current }
    var window: TimeInterval { TimeInterval((elapsedWindowMinutes ?? 30) * 60) }
    var adhans: [Date] { prayers.filter(\.isFard).map(\.date) }

    func phase(at now: Date) -> PrayerPhase { PrayerPhase.resolve(now: now, adhans: adhans, window: window) }

    func prayer(at date: Date) -> Prayer? { prayers.first { $0.isFard && $0.date == date } }

    /// صلوات اليوم المحلي للعرض في القائمة.
    func today(now: Date) -> [Prayer] {
        var cal = Calendar(identifier: .gregorian); cal.timeZone = timeZone
        return prayers.filter { cal.isDate($0.date, inSameDayAs: now) }.sorted { $0.epochMs < $1.epochMs }
    }
}

/// عدّادات اليوم تُحفظ محليًا وتُصفَّر بتغيّر اليوم.
struct WatchProgress: Codable, Equatable {
    var dayKey: String
    var counts: [String: Int] = [:]   // "<set>/<dhikr>" -> عدد
    var tasbih: Int = 0
}

/// ثوابت مشتركة بين تطبيق الساعة وامتداد الـComplications (خارج أي actor).
enum WatchShared {
    static let payloadKey = "sunnah.watch.payload.v1"
    static let progressKey = "sunnah.watch.progress.v1"
    static let suiteName = "group.com.yousef.majlisilm.watch"
    static var suite: UserDefaults { UserDefaults(suiteName: suiteName) ?? .standard }
}
