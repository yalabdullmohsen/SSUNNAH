// تفضيلات «المظهر»: السمة + خط التطبيق + حجم النص. تُطبَّق عالميًا عبر `.sunnahAppearance()` عند الجذر.
import SwiftUI

public enum AppearancePrefs {
    public static let themeKey = "sunnah.appearance.theme"
    public static let fontKey = "sunnah.appearance.font"
    public static let sizeKey = "sunnah.appearance.textSize"

    public enum Theme: String, CaseIterable, Identifiable {
        case system, light, dark
        public var id: String { rawValue }
        var title: String { switch self { case .system: "حسب النظام"; case .light: "فاتح"; case .dark: "داكن" } }
        var scheme: ColorScheme? { switch self { case .system: nil; case .light: .light; case .dark: .dark } }
    }
    public enum AppFont: String, CaseIterable, Identifiable {
        case almarai, naskh, system
        public var id: String { rawValue }
        var title: String { switch self { case .almarai: "المراعي"; case .naskh: "نسخ"; case .system: "النظام" } }
        /// اسم الخط حسب الوزن؛ nil = خط النظام.
        func face(_ weight: Weight) -> String? {
            switch (self, weight) {
            case (.almarai, .regular): "Almarai-Regular"
            case (.almarai, .bold): "Almarai-Bold"
            case (.almarai, .extraBold): "Almarai-ExtraBold"
            case (.naskh, .regular): "NotoNaskhArabic-Regular"
            case (.naskh, _): "NotoNaskhArabic-Bold"
            case (.system, _): nil
            }
        }
    }
    public enum Weight { case regular, bold, extraBold }
    public enum TextSize: Int, CaseIterable, Identifiable {
        case small, standard, large, xLarge
        public var id: Int { rawValue }
        var title: String { switch self { case .small: "صغير"; case .standard: "عادي"; case .large: "كبير"; case .xLarge: "كبير جدًا" } }
        var type: DynamicTypeSize { switch self { case .small: .small; case .standard: .large; case .large: .xxxLarge; case .xLarge: .accessibility1 } }
    }

    static var font: AppFont { AppFont(rawValue: UserDefaults.standard.string(forKey: fontKey) ?? "") ?? .almarai }

    /// خط واجهة حسب التفضيل الحالي (يُستعمل من `Sunnah.Typography`).
    static func ui(_ weight: Weight, _ size: CGFloat, _ style: Font.TextStyle) -> Font {
        if let name = font.face(weight) { return .custom(name, size: size, relativeTo: style) }
        return .system(size: size, weight: weight == .regular ? .regular : (weight == .bold ? .bold : .heavy))
    }
}

public struct SunnahAppearanceModifier: ViewModifier {
    @AppStorage(AppearancePrefs.themeKey) private var theme = AppearancePrefs.Theme.system.rawValue
    @AppStorage(AppearancePrefs.fontKey) private var font = AppearancePrefs.AppFont.almarai.rawValue
    @AppStorage(AppearancePrefs.sizeKey) private var size = AppearancePrefs.TextSize.standard.rawValue
    public init() {}
    public func body(content: Content) -> some View {
        content
            .id(font)
            .preferredColorScheme((AppearancePrefs.Theme(rawValue: theme) ?? .system).scheme)
            .dynamicTypeSize((AppearancePrefs.TextSize(rawValue: size) ?? .standard).type)
    }
}

public extension View { func sunnahAppearance() -> some View { modifier(SunnahAppearanceModifier()) } }

struct AppearanceOptionsView: View {
    @AppStorage(AppearancePrefs.themeKey) private var theme = AppearancePrefs.Theme.system.rawValue
    @AppStorage(AppearancePrefs.fontKey) private var font = AppearancePrefs.AppFont.almarai.rawValue
    @AppStorage(AppearancePrefs.sizeKey) private var size = AppearancePrefs.TextSize.standard.rawValue
    var body: some View {
        Picker("السمة", selection: $theme) { ForEach(AppearancePrefs.Theme.allCases) { Text($0.title).tag($0.rawValue) } }
            .accessibilityIdentifier("settings.theme")
        Picker("خط التطبيق", selection: $font) { ForEach(AppearancePrefs.AppFont.allCases) { Text($0.title).tag($0.rawValue) } }
            .accessibilityIdentifier("settings.font")
        Picker("حجم النص", selection: $size) { ForEach(AppearancePrefs.TextSize.allCases) { Text($0.title).tag($0.rawValue) } }
            .accessibilityIdentifier("settings.textSize")
    }
}
