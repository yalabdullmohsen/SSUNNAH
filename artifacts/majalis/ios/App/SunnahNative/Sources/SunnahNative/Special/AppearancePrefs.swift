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
        /// إزاحة بخطوات Dynamic Type فوق حجم النظام (لا بديلًا عنه).
        var step: Int { switch self { case .small: -2; case .standard: 0; case .large: 2; case .xLarge: 4 } }
    }

    static var font: AppFont { AppFont(rawValue: UserDefaults.standard.string(forKey: fontKey) ?? "") ?? .almarai }

    /// خط واجهة حسب التفضيل الحالي (يُستعمل من `Sunnah.Typography`).
    static func ui(_ weight: Weight, _ size: CGFloat, _ style: Font.TextStyle) -> Font {
        if let name = font.face(weight) { return .custom(name, size: size, relativeTo: style) }
        return .system(size: size, weight: weight == .regular ? .regular : (weight == .bold ? .bold : .heavy))
    }
}

public extension AppearancePrefs {
    /// حجم النظام + إزاحة التفضيل الداخلي، بحدّ أعلى accessibility3 لتفادي كسر التخطيط.
    static func effectiveSize(system: DynamicTypeSize, pref: TextSize) -> DynamicTypeSize {
        let all = DynamicTypeSize.allCases
        let i = all.firstIndex(of: system) ?? all.firstIndex(of: .large) ?? 0
        let cap = all.firstIndex(of: .accessibility3) ?? (all.count - 1)
        return all[max(0, min(cap, i + pref.step))]
    }
}

public struct SunnahAppearanceModifier: ViewModifier {
    @Environment(\.dynamicTypeSize) private var systemSize
    @AppStorage(AppearancePrefs.themeKey) private var theme = AppearancePrefs.Theme.system.rawValue
    @AppStorage(AppearancePrefs.fontKey) private var font = AppearancePrefs.AppFont.almarai.rawValue
    @AppStorage(AppearancePrefs.sizeKey) private var size = AppearancePrefs.TextSize.standard.rawValue
    public init() {}
    public func body(content: Content) -> some View {
        content
            .id(font)
            .preferredColorScheme((AppearancePrefs.Theme(rawValue: theme) ?? .system).scheme)
            .dynamicTypeSize(AppearancePrefs.effectiveSize(system: systemSize, pref: AppearancePrefs.TextSize(rawValue: size) ?? .standard))
    }
}

public extension View { func sunnahAppearance() -> some View { modifier(SunnahAppearanceModifier()) } }

struct AppearanceOptionsView: View {
    @AppStorage(AppearancePrefs.themeKey) private var theme = AppearancePrefs.Theme.system.rawValue
    @AppStorage(AppearancePrefs.fontKey) private var font = AppearancePrefs.AppFont.almarai.rawValue
    var body: some View {
        row("السمة", "settings.theme", AppearancePrefs.Theme.allCases.map { ($0.rawValue, $0.title) }, $theme)
        row("خط التطبيق", "settings.font", AppearancePrefs.AppFont.allCases.map { ($0.rawValue, $0.title) }, $font, isLast: true)
    }

    private func row<ID: Hashable>(_ title: String, _ id: String, _ options: [(ID, String)], _ selection: Binding<ID>, isLast: Bool = false) -> some View {
        AppearanceOptionRow(title: title, id: id, options: options, selection: selection, isLast: isLast)
    }
}

/// «حجم النص» مع معاينة حيّة (مجموعة «المصحف» في الإعدادات): العيّنة تتبع الحجم المختار فورًا.
struct TextSizeOptionsView: View {
    @AppStorage(AppearancePrefs.sizeKey) private var size = AppearancePrefs.TextSize.standard.rawValue
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            AppearanceOptionRow(title: "حجم الخط", id: "settings.textSize",
                                options: AppearancePrefs.TextSize.allCases.map { ($0.rawValue, $0.title) }, selection: $size, isLast: false)
            Text("معاينة حجم الخط")
                .font(Sunnah.Typography.quran).foregroundStyle(Sunnah.Colors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.vertical, 18).padding(.horizontal, 12)
                .background(Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                .padding(.vertical, 12)
                .accessibilityIdentifier("settings.textSize.preview")
        }
    }
}

struct AppearanceOptionRow<ID: Hashable>: View {
    let title: String; let id: String; let options: [(ID, String)]; let selection: Binding<ID>; let isLast: Bool
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(AppearancePrefs.ui(.bold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.textSecondary)
            SunnahSegmented(options, selection: selection)
        }
        .padding(.vertical, 14).frame(maxWidth: .infinity, alignment: .leading)
        .background(alignment: .bottom) { if !isLast { Rectangle().fill(Sunnah.Colors.border).frame(height: 1) } }
        .accessibilityElement(children: .contain).accessibilityIdentifier(id)
    }
}
