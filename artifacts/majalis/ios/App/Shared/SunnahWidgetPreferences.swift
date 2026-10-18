import Foundation

/// تفضيلات الودجات غير السرّية في App Group: نمط عرض الصلاة وحجم النص. التطبيق يكتب والودجت/الساعة يقرآن.
enum SunnahWidgetPreferences {
    enum PrayerStyle: String, CaseIterable {
        case compact, detailed
    }

    enum TextScale: String, CaseIterable {
        case standard, large
    }

    private enum Key {
        static let prayerStyle = "widget.pref.prayerStyle"
        static let textScale = "widget.pref.textScale"
    }

    static var prayerStyle: PrayerStyle {
        get { read(Key.prayerStyle, default: .detailed) }
        set { SunnahAppGroup.defaults?.set(newValue.rawValue, forKey: Key.prayerStyle) }
    }

    static var textScale: TextScale {
        get { read(Key.textScale, default: .standard) }
        set { SunnahAppGroup.defaults?.set(newValue.rawValue, forKey: Key.textScale) }
    }

    private static func read<T: RawRepresentable>(_ key: String, default value: T) -> T where T.RawValue == String {
        guard let raw = SunnahAppGroup.defaults?.string(forKey: key), let v = T(rawValue: raw) else { return value }
        return v
    }
}
