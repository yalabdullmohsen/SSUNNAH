import Foundation

/// مجموعات الإشعارات الأصلية الخمس. الصلاة يخططها PrayerNotificationPlanner كما هو؛ الباقي هنا.
public enum NotificationGroup: String, Codable, CaseIterable, Sendable {
    case prayer, adhkar, wird, periodic, events
}

/// خيارات المجموعات غير الصلاة — تُحفظ في App Group. ساعات الهدوء والسقف اليومي لا تمس الصلاة.
public struct GeneralNotificationOptions: Codable, Hashable, Sendable {
    public var adhkarEnabled: Bool
    /// أذكار الصباح بعد الفجر، والمساء بعد العصر (بالدقائق).
    public var morningAfterFajrMinutes: Int
    public var eveningAfterAsrMinutes: Int
    public var wirdEnabled: Bool
    /// وقت الورد اليومي بالدقائق من منتصف الليل.
    public var wirdMinuteOfDay: Int
    /// التذكير الصوتي الدوري — مطفأ افتراضيًا.
    public var periodicEnabled: Bool
    public var periodicIntervalMinutes: Int
    public var eventsEnabled: Bool
    /// ساعات الهدوء بالدقائق من منتصف الليل؛ تساوي الطرفين يعطّلها.
    public var quietStartMinute: Int
    public var quietEndMinute: Int
    /// أقصى عدد إشعارات غير الصلاة في اليوم الواحد.
    public var dailyCap: Int

    public init(
        adhkarEnabled: Bool = true,
        morningAfterFajrMinutes: Int = 20,
        eveningAfterAsrMinutes: Int = 30,
        wirdEnabled: Bool = false,
        wirdMinuteOfDay: Int = 21 * 60,
        periodicEnabled: Bool = false,
        periodicIntervalMinutes: Int = 120,
        eventsEnabled: Bool = true,
        quietStartMinute: Int = 23 * 60,
        quietEndMinute: Int = 5 * 60,
        dailyCap: Int = 6
    ) {
        self.adhkarEnabled = adhkarEnabled
        self.morningAfterFajrMinutes = morningAfterFajrMinutes
        self.eveningAfterAsrMinutes = eveningAfterAsrMinutes
        self.wirdEnabled = wirdEnabled
        self.wirdMinuteOfDay = wirdMinuteOfDay
        self.periodicEnabled = periodicEnabled
        self.periodicIntervalMinutes = periodicIntervalMinutes
        self.eventsEnabled = eventsEnabled
        self.quietStartMinute = quietStartMinute
        self.quietEndMinute = quietEndMinute
        self.dailyCap = dailyCap
    }

    static let key = "sunnah.notifications.general.v1"

    public static func read(from defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) -> GeneralNotificationOptions {
        guard let data = defaults.data(forKey: key),
              let value = try? JSONDecoder().decode(GeneralNotificationOptions.self, from: data) else { return GeneralNotificationOptions() }
        return value
    }

    public func save(to defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) {
        if let data = try? JSONEncoder().encode(self) { defaults.set(data, forKey: Self.key) }
    }

    /// هل تقع الدقيقة في ساعات الهدوء (مع الالتفاف عبر منتصف الليل)؟
    func isQuiet(minuteOfDay m: Int) -> Bool {
        let s = quietStartMinute, e = quietEndMinute
        if s == e { return false }
        return s < e ? (m >= s && m < e) : (m >= s || m < e)
    }
}

/// مناسبة أو درس يُذكَّر به — يكتبها التطبيق في App Group تحت sunnah.events.v1.
public struct NotificationEvent: Codable, Hashable, Sendable {
    public let id: String
    public let title: String
    public let body: String?
    /// ثوانٍ منذ 1970.
    public let fireAt: Double

    public init(id: String, title: String, body: String? = nil, fireAt: Double) {
        self.id = id
        self.title = title
        self.body = body
        self.fireAt = fireAt
    }

    static let key = "sunnah.events.v1"

    public static func read(from defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) -> [NotificationEvent] {
        guard let data = defaults.data(forKey: key),
              let value = try? JSONDecoder().decode([NotificationEvent].self, from: data) else { return [] }
        return value
    }
}

public struct PlannedGeneralNotification: Hashable, Sendable {
    public let id: String
    public let group: NotificationGroup
    public let fireDate: Date
    public let title: String
    public let body: String
}

public enum GeneralNotificationPlanner {
    /// بادئة معرّفات المجموعات غير الصلاة — يُلغى بها ما جدولناه فقط.
    public static let idPrefix = "sunnah.general."

    /// أولوية الاحتفاظ عند بلوغ السقف اليومي.
    static let priority: [NotificationGroup] = [.events, .adhkar, .wird, .periodic]

    /// يملأ السعة الباقية (≤ 64 − المعلّق) بنافذة متحركة 7 أيام، مع ساعات الهدوء والسقف اليومي.
    public static func plan(
        location: PrayerLocation,
        settings: PrayerSettings,
        options: GeneralNotificationOptions,
        events: [NotificationEvent] = [],
        now: Date = Date(),
        capacity: Int
    ) -> [PlannedGeneralNotification] {
        guard capacity > 0 else { return [] }
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = location.timeZone
        let days = PrayerCalculator.days(for: location, from: now, count: PrayerNotificationBudget.windowDays, settings: settings)

        func minuteOfDay(_ date: Date) -> Int {
            let c = calendar.dateComponents([.hour, .minute], from: date)
            return (c.hour ?? 0) * 60 + (c.minute ?? 0)
        }

        var out: [PlannedGeneralNotification] = []
        for day in days {
            let start = calendar.startOfDay(for: day.time(.fajr))
            var candidates: [PlannedGeneralNotification] = []
            if options.adhkarEnabled {
                candidates.append(.init(id: "\(idPrefix)adhkar.\(day.dayKey).morning", group: .adhkar,
                                        fireDate: day.time(.fajr).addingTimeInterval(Double(options.morningAfterFajrMinutes) * 60),
                                        title: "أذكار الصباح", body: "حصّن يومك بأذكار الصباح"))
                candidates.append(.init(id: "\(idPrefix)adhkar.\(day.dayKey).evening", group: .adhkar,
                                        fireDate: day.time(.asr).addingTimeInterval(Double(options.eveningAfterAsrMinutes) * 60),
                                        title: "أذكار المساء", body: "حصّن مساءك بأذكار المساء"))
            }
            if options.wirdEnabled {
                candidates.append(.init(id: "\(idPrefix)wird.\(day.dayKey)", group: .wird,
                                        fireDate: start.addingTimeInterval(Double(options.wirdMinuteOfDay) * 60),
                                        title: "وردك اليومي", body: "لا تنسَ وردك من القرآن"))
            }
            if options.periodicEnabled, options.periodicIntervalMinutes >= 15 {
                var m = options.quietEndMinute
                var n = 0
                while m < 24 * 60 {
                    candidates.append(.init(id: "\(idPrefix)periodic.\(day.dayKey).\(n)", group: .periodic,
                                            fireDate: start.addingTimeInterval(Double(m) * 60),
                                            title: "ذكر", body: "سبحان الله وبحمده، سبحان الله العظيم"))
                    m += options.periodicIntervalMinutes
                    n += 1
                }
            }
            if options.eventsEnabled {
                let end = start.addingTimeInterval(86400)
                for e in events {
                    let date = Date(timeIntervalSince1970: e.fireAt)
                    guard date >= start, date < end else { continue }
                    candidates.append(.init(id: "\(idPrefix)events.\(e.id)", group: .events, fireDate: date,
                                            title: e.title, body: e.body ?? ""))
                }
            }

            let eligible = candidates.filter { $0.fireDate > now && !options.isQuiet(minuteOfDay: minuteOfDay($0.fireDate)) }
            let kept = eligible
                .sorted { a, b in
                    let pa = priority.firstIndex(of: a.group)!, pb = priority.firstIndex(of: b.group)!
                    return pa != pb ? pa < pb : a.fireDate < b.fireDate
                }
                .prefix(max(0, options.dailyCap))
            out.append(contentsOf: kept)
        }
        var seen = Set<String>()
        return Array(out.filter { seen.insert($0.id).inserted }
            .sorted { $0.fireDate < $1.fireDate }
            .prefix(capacity))
    }
}
