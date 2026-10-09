import Foundation

/// موافقة المستخدم الصريحة من إعدادات التطبيق (يكتبها الويب في App Group عند التفعيل/الإيقاف).
/// بلا سجلّ محفوظ ⇒ الكل مطفأ ⇒ لا يجدول الأصلي شيئًا (opt-in).
public struct NativeNotificationsOptIn: Codable, Hashable, Sendable {
    public var prayer: Bool
    public var adhkar: Bool

    public init(prayer: Bool = false, adhkar: Bool = false) {
        self.prayer = prayer
        self.adhkar = adhkar
    }

    public var isAnyEnabled: Bool { prayer || adhkar }

    static let key = "sunnah.notifications.optin.v1"

    public static func read(from defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) -> NativeNotificationsOptIn {
        guard let data = defaults.data(forKey: key),
              let value = try? JSONDecoder().decode(NativeNotificationsOptIn.self, from: data) else { return NativeNotificationsOptIn() }
        return value
    }

    public func write(to defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) {
        guard let data = try? JSONEncoder().encode(self) else { return }
        defaults.set(data, forKey: Self.key)
    }

    /// يحصر خيارات المجموعات العامة بما وافق عليه المستخدم: الورد والدوري والمناسبات ليست ضمن 1.1.0.
    public func limiting(_ options: GeneralNotificationOptions) -> GeneralNotificationOptions {
        var out = options
        out.adhkarEnabled = options.adhkarEnabled && adhkar
        out.wirdEnabled = false
        out.periodicEnabled = false
        out.eventsEnabled = false
        return out
    }
}
