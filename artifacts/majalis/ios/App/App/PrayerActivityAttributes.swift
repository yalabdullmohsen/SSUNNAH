import Foundation
#if canImport(ActivityKit)
import ActivityKit

/// حالات Live Activity للصلاة — Prayer-only (لا قرآن/أذكار/فتاوى).
@available(iOS 16.2, *)
enum PrayerLivePhase: String, Codable, Hashable {
    /// قبل الأذان — اسم الصلاة + العد التنازلي
    case upcoming
    /// نافذة الصلاة الحالية — الحالة «حان الآن»
    case active
    /// بعد انتهاء النافذة — الصلاة التالية + عد تنازلي
    case completed
    /// بدون جدول كافٍ — دعوة لفتح شاشة المواقيت
    case appLaunch
}

/// بنية بيانات Live Activity — مشتركة بين التطبيق وإضافة PrayerLiveActivity.
@available(iOS 16.2, *)
struct PrayerActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// اسم الصلاة الحالية/القادمة بالعربية
        var prayerName: String
        /// وقت الصلاة المرجعي للعدّ التنازلي (upcoming/active)
        var prayerTime: Date
        var locationLabel: String
        /// توافق خلفي مع الإصدارات السابقة
        var hasStarted: Bool
        var phase: PrayerLivePhase
        /// نص الحالة المعروض (مثل «قادمة» / «حان الآن» / «اكتملت»)
        var statusLabel: String
        var nextPrayerName: String?
        var nextPrayerKey: String?
        var nextPrayerTime: Date?

        enum CodingKeys: String, CodingKey {
            case prayerName, prayerTime, locationLabel, hasStarted
            case phase, statusLabel, nextPrayerName, nextPrayerKey, nextPrayerTime
        }

        init(
            prayerName: String,
            prayerTime: Date,
            locationLabel: String,
            hasStarted: Bool,
            phase: PrayerLivePhase? = nil,
            statusLabel: String? = nil,
            nextPrayerName: String? = nil,
            nextPrayerKey: String? = nil,
            nextPrayerTime: Date? = nil
        ) {
            self.prayerName = prayerName
            self.prayerTime = prayerTime
            self.locationLabel = locationLabel
            self.hasStarted = hasStarted
            let resolved = phase ?? (hasStarted ? .active : .upcoming)
            self.phase = resolved
            self.statusLabel = statusLabel ?? Self.defaultStatus(for: resolved)
            self.nextPrayerName = nextPrayerName
            self.nextPrayerKey = nextPrayerKey
            self.nextPrayerTime = nextPrayerTime
        }

        public init(from decoder: Decoder) throws {
            let c = try decoder.container(keyedBy: CodingKeys.self)
            prayerName = try c.decode(String.self, forKey: .prayerName)
            prayerTime = try c.decode(Date.self, forKey: .prayerTime)
            locationLabel = try c.decode(String.self, forKey: .locationLabel)
            hasStarted = try c.decode(Bool.self, forKey: .hasStarted)
            phase = try c.decodeIfPresent(PrayerLivePhase.self, forKey: .phase)
                ?? (hasStarted ? .active : .upcoming)
            statusLabel = try c.decodeIfPresent(String.self, forKey: .statusLabel)
                ?? Self.defaultStatus(for: phase)
            nextPrayerName = try c.decodeIfPresent(String.self, forKey: .nextPrayerName)
            nextPrayerKey = try c.decodeIfPresent(String.self, forKey: .nextPrayerKey)
            nextPrayerTime = try c.decodeIfPresent(Date.self, forKey: .nextPrayerTime)
        }

        public func encode(to encoder: Encoder) throws {
            var c = encoder.container(keyedBy: CodingKeys.self)
            try c.encode(prayerName, forKey: .prayerName)
            try c.encode(prayerTime, forKey: .prayerTime)
            try c.encode(locationLabel, forKey: .locationLabel)
            try c.encode(hasStarted, forKey: .hasStarted)
            try c.encode(phase, forKey: .phase)
            try c.encode(statusLabel, forKey: .statusLabel)
            try c.encodeIfPresent(nextPrayerName, forKey: .nextPrayerName)
            try c.encodeIfPresent(nextPrayerKey, forKey: .nextPrayerKey)
            try c.encodeIfPresent(nextPrayerTime, forKey: .nextPrayerTime)
        }

        static func defaultStatus(for phase: PrayerLivePhase) -> String {
            switch phase {
            case .upcoming: return "قادمة"
            case .active: return "حان الآن"
            case .completed: return "اكتملت"
            case .appLaunch: return "افتح مواقيت الصلاة"
            }
        }
    }

    /// مفتاح الصلاة الأساسية (fajr/dhuhr/…) — ثابت طوال عمر النشاط
    var prayerKey: String
}
#endif
