import Foundation

/// خيارات تنبيهات الصلاة الأصلية — تُحفظ في App Group مستقلة عن تفضيلات الموقع.
public struct PrayerNotificationOptions: Codable, Hashable, Sendable {
    /// الصلوات المفعّلة (الفروض فقط؛ الشروق لا يُنبَّه له).
    public var enabledPrayers: Set<Prayer>
    /// تنبيه قبل الدخول بعدد دقائق؛ صفر يعطّله.
    public var minutesBefore: Int
    /// صوت الأذان عند الدخول؛ وإلا فتنبيه قصير.
    public var adhanEnabled: Bool
    /// أذان مكة الكامل متعدد المقاطع لأقرب الصلوات حين تتسع الحصة.
    public var fullAdhanChain: Bool

    public init(
        enabledPrayers: Set<Prayer> = Set(Prayer.allCases.filter(\.isObligatory)),
        minutesBefore: Int = 0,
        adhanEnabled: Bool = true,
        fullAdhanChain: Bool = true
    ) {
        self.enabledPrayers = enabledPrayers
        self.minutesBefore = minutesBefore
        self.adhanEnabled = adhanEnabled
        self.fullAdhanChain = fullAdhanChain
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
    public enum Kind: String, Sendable { case pre, enter, adhanSegment }
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
    public static let fullChainSlots = 4
    public static let maxChainSegments = 4
    /// طول كل مقطع أذان (حد صوت إشعار iOS 30ث).
    public static let segmentSeconds: TimeInterval = 28
}

public enum PrayerNotificationPlanner {
    /// بادئة كل معرّفات الصلاة — يُلغى بها ما جدولناه فقط دون مس إشعارات الأذكار.
    public static let idPrefix = "sunnah.prayer."

    struct Slot {
        let prayer: Prayer
        let dayKey: String
        let time: Date
        let alertCount: Int
        let adhan: Bool
        let chainLength: Int
    }

    struct SlotPlan: Equatable {
        var include: Bool
        var segmentCount: Int
        var cost: Int
    }

    /// مرحلتان كالويب: تغطية الأيام بالكلفة الدنيا من الأقرب حتى أول صلاة لا تتسع (بلا فجوات)،
    /// ثم يُرقّي الباقي أقرب الصلوات إلى أذان كامل.
    static func budget(_ slots: [Slot], share: Int = PrayerNotificationBudget.prayerShare,
                       fullSlots: Int = PrayerNotificationBudget.fullChainSlots) -> [SlotPlan] {
        let minCost = slots.map { $0.alertCount + ($0.adhan ? 1 : 0) }
        var used = 0
        var cut = slots.count
        for i in slots.indices {
            if used + minCost[i] > share { cut = i; break }
            used += minCost[i]
        }
        var plans = slots.indices.map { i in
            i < cut ? SlotPlan(include: true, segmentCount: slots[i].adhan ? 1 : 0, cost: minCost[i])
                    : SlotPlan(include: false, segmentCount: 0, cost: 0)
        }
        var leftover = share - used
        var upgraded = 0
        for i in 0..<cut where upgraded < fullSlots && slots[i].adhan {
            let chain = max(1, min(PrayerNotificationBudget.maxChainSegments, slots[i].chainLength))
            let extra = chain - 1
            if extra > 0 && leftover >= extra {
                plans[i] = SlotPlan(include: true, segmentCount: chain, cost: slots[i].alertCount + chain)
                leftover -= extra
                upgraded += 1
            }
        }
        return plans
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
        let pre = options.minutesBefore > 0
        var slots: [Slot] = []
        for day in days {
            for (prayer, time) in day.ordered where prayer.isObligatory && options.enabledPrayers.contains(prayer) {
                // التنبيه المسبق يُجدول فقط إن كان في المستقبل؛ وإلا تبقى الصلاة بدخولها.
                let preUsable = pre && time.addingTimeInterval(-Double(options.minutesBefore) * 60) > now
                guard time > now || preUsable else { continue }
                let enterAlert = options.adhanEnabled ? 0 : 1
                let chain = options.adhanEnabled && options.fullAdhanChain && prayer != .fajr ? PrayerNotificationBudget.maxChainSegments : 1
                slots.append(Slot(prayer: prayer, dayKey: day.dayKey, time: time,
                                  alertCount: (preUsable ? 1 : 0) + (time > now ? enterAlert : 0),
                                  adhan: options.adhanEnabled && time > now, chainLength: chain))
            }
        }
        slots.sort { $0.time < $1.time }
        let plans = budget(slots, share: share)

        var out: [PlannedPrayerNotification] = []
        for (slot, plan) in zip(slots, plans) where plan.include {
            let base = "\(idPrefix)\(slot.dayKey).\(slot.prayer.rawValue)"
            let name = slot.prayer.nameAr
            if pre, slot.time.addingTimeInterval(-Double(options.minutesBefore) * 60) > now {
                out.append(.init(id: base + ".pre", prayer: slot.prayer, kind: .pre,
                                 fireDate: slot.time.addingTimeInterval(-Double(options.minutesBefore) * 60),
                                 title: "اقترب وقت \(name)", body: "بعد \(options.minutesBefore) دقيقة",
                                 sound: "prayer-alert.caf"))
            }
            guard slot.time > now else { continue }
            if slot.adhan {
                for i in 0..<plan.segmentCount {
                    let first = i == 0
                    let sound: String
                    if plan.segmentCount > 1 { sound = "adhan-seq-makkah-0\(i + 1).caf" }
                    else { sound = slot.prayer == .fajr ? "adhan-short-makkah-fajr.caf" : "adhan-short-makkah.caf" }
                    out.append(.init(id: base + (first ? ".enter" : ".seg\(i + 1)"), prayer: slot.prayer,
                                     kind: first ? .enter : .adhanSegment,
                                     fireDate: slot.time.addingTimeInterval(Double(i) * PrayerNotificationBudget.segmentSeconds),
                                     title: first ? "حان وقت \(name)" : "الأذان",
                                     body: first ? "حيّ على الصلاة" : "",
                                     sound: sound))
                }
            } else {
                out.append(.init(id: base + ".enter", prayer: slot.prayer, kind: .enter, fireDate: slot.time,
                                 title: "حان وقت \(name)", body: "حيّ على الصلاة", sound: "prayer_default.caf"))
            }
        }
        return out.sorted { $0.fireDate < $1.fireDate }
    }
}
