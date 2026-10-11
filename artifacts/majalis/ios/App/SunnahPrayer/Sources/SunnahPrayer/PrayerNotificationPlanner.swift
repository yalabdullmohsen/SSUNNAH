import Foundation

/// خيارات تنبيهات الصلاة الأصلية — تُحفظ في App Group مستقلة عن تفضيلات الموقع.
/// لا أذان في التطبيق (قرار المالك): تنبيهان صوتيان قصيران بعبارة فقط، قبل الوقت وعنده.
public struct PrayerNotificationOptions: Codable, Hashable, Sendable {
    /// الصلوات المفعّلة (الفروض فقط؛ الشروق لا يُنبَّه له).
    public var enabledPrayers: Set<Prayer>
    /// تنبيه «اقترب أذان …» قبل الدخول بعدد دقائق؛ صفر يعطّله.
    public var minutesBefore: Int

    public init(
        enabledPrayers: Set<Prayer> = Set(Prayer.allCases.filter(\.isObligatory)),
        minutesBefore: Int = 10
    ) {
        self.enabledPrayers = enabledPrayers
        self.minutesBefore = minutesBefore
    }

    static let key = "sunnah.prayer.notifications.v1"

    public static func read(from defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) -> PrayerNotificationOptions {
        guard let data = defaults.data(forKey: key),
              let value = try? JSONDecoder().decode(PrayerNotificationOptions.self, from: data) else { return PrayerNotificationOptions() }
        return value
    }

    public func save(to defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) {
        if let data = try? JSONEncoder().encode(self) { defaults.set(data, forKey: Self.key) }
    }
}

/// إشعار مخطّط واحد — بيانات نقية تُحوَّل إلى UNNotificationRequest في المُجدول.
public struct PlannedPrayerNotification: Hashable, Sendable {
    public enum Kind: String, Sendable { case pre, enter }
    public let id: String
    public let prayer: Prayer
    public let kind: Kind
    public let fireDate: Date
    public let title: String
    public let body: String
    public let sound: String
}

/// ميزانية الإشعارات على iOS — نفس سياسة الويب (src/lib/prayer-native-budget.ts) حتى لا يختلف المصدران.
public enum PrayerNotificationBudget {
    public static let iosPendingLimit = 64
    /// حصة الصلاة؛ الـ24 الباقية للأذكار والورد.
    public static let prayerShare = 40
    public static let windowDays = 7
}

public enum PrayerNotificationPlanner {
    /// بادئة كل معرّفات الصلاة — يُلغى بها ما جدولناه فقط دون مس إشعارات الأذكار.
    public static let idPrefix = "sunnah.prayer."

    /// اسم ملف التنبيه الصوتي لصلاة ونوع (10 أسماء ثابتة: prayer_pre_fajr.caf … prayer_now_isha.caf).
    public static func soundName(prayer: Prayer, kind: PlannedPrayerNotification.Kind) -> String {
        "prayer_\(kind == .pre ? "pre" : "now")_\(prayer.rawValue).caf"
    }

    /// كل أسماء الأصوات العشرة للفروض الخمسة.
    public static var allSoundNames: [String] {
        Prayer.allCases.filter(\.isObligatory).flatMap { p in
            [soundName(prayer: p, kind: .pre), soundName(prayer: p, kind: .enter)]
        }
    }

    struct Slot {
        let prayer: Prayer
        let dayKey: String
        let time: Date
        let alertCount: Int
    }

    /// تغطية الأيام بلا فجوات: من الأقرب حتى أول صلاة لا تتسع الحصة لتنبيهاتها.
    static func budget(_ slots: [Slot], share: Int = PrayerNotificationBudget.prayerShare) -> [Bool] {
        var used = 0
        var cut = slots.count
        for i in slots.indices {
            if used + slots[i].alertCount > share { cut = i; break }
            used += slots[i].alertCount
        }
        return slots.indices.map { $0 < cut }
    }

    /// يبني إشعارات النافذة القادمة (حتى 7 أيام) مرتبة زمنيًا ولا تتجاوز حصة الصلاة.
    public static func plan(
        location: PrayerLocation,
        settings: PrayerSettings,
        options: PrayerNotificationOptions,
        now: Date = Date(),
        share: Int = PrayerNotificationBudget.prayerShare
    ) -> [PlannedPrayerNotification] {
        let days = PrayerCalculator.days(for: location, from: now, count: PrayerNotificationBudget.windowDays, settings: settings)
        let lead = Double(options.minutesBefore) * 60
        let pre = options.minutesBefore > 0
        var slots: [Slot] = []
        for day in days {
            for (prayer, time) in day.ordered where prayer.isObligatory && options.enabledPrayers.contains(prayer) {
                // التنبيه المسبق يُجدول فقط إن كان في المستقبل؛ وإلا تبقى الصلاة بدخولها.
                let preUsable = pre && time.addingTimeInterval(-lead) > now
                guard time > now || preUsable else { continue }
                slots.append(Slot(prayer: prayer, dayKey: day.dayKey, time: time,
                                  alertCount: (preUsable ? 1 : 0) + (time > now ? 1 : 0)))
            }
        }
        slots.sort { $0.time < $1.time }
        let included = budget(slots, share: share)

        var out: [PlannedPrayerNotification] = []
        for (slot, keep) in zip(slots, included) where keep {
            let base = "\(idPrefix)\(slot.dayKey).\(slot.prayer.rawValue)"
            let name = slot.prayer.nameAr
            if pre, slot.time.addingTimeInterval(-lead) > now {
                out.append(.init(id: base + ".pre", prayer: slot.prayer, kind: .pre,
                                 fireDate: slot.time.addingTimeInterval(-lead),
                                 title: "اقترب أذان \(name)", body: "بعد \(options.minutesBefore) دقيقة",
                                 sound: soundName(prayer: slot.prayer, kind: .pre)))
            }
            guard slot.time > now else { continue }
            out.append(.init(id: base + ".enter", prayer: slot.prayer, kind: .enter, fireDate: slot.time,
                             title: "حان الآن موعد أذان \(name)", body: "حيّ على الصلاة",
                             sound: soundName(prayer: slot.prayer, kind: .enter)))
        }
        return out.sorted { $0.fireDate < $1.fireDate }
    }
}
