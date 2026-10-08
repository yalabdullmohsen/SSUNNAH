import Combine
import Foundation

/// تفضيلات المواقيت المحفوظة: الموقع المختار وإعدادات الحساب.
public struct PrayerPreferences: Codable, Hashable, Sendable {
    public var location: PrayerLocation
    /// الموقع من GPS الجهاز (يُحدَّث عند الفتح) أم مدينة اختارها المستخدم.
    public var usesDeviceLocation: Bool
    public var settings: PrayerSettings

    public init(location: PrayerLocation = .kuwaitCity, usesDeviceLocation: Bool = false, settings: PrayerSettings = PrayerSettings()) {
        self.location = location
        self.usesDeviceLocation = usesDeviceLocation
        self.settings = settings
    }
}

/// يحفظ التفضيلات في App Group ليقرأها الودجت والإشعارات دون فتح التطبيق.
@MainActor
public final class PrayerPreferencesStore: ObservableObject {
    public static let appGroup = "group.com.yousef.majlisilm"
    static let key = "sunnah.prayer.preferences.v1"

    @Published public var preferences: PrayerPreferences {
        didSet { if preferences != oldValue { save() } }
    }

    private let defaults: UserDefaults

    public init(defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) {
        self.defaults = defaults
        preferences = Self.read(from: defaults) ?? PrayerPreferences()
    }

    /// قراءة بلا كائن مراقَب — للودجت ومهمة الخلفية.
    public nonisolated static func read(from defaults: UserDefaults = UserDefaults(suiteName: appGroup) ?? .standard) -> PrayerPreferences? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(PrayerPreferences.self, from: data)
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(preferences) else { return }
        defaults.set(data, forKey: Self.key)
    }
}
