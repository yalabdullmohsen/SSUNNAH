import SwiftUI

/// رموز «سُنّة» البصرية للحزمة — مطابقة لـ App/Design/SunnahTokens.swift. المصدر الوحيد للقيم في Templates/Components/Generated.
public enum Sunnah {
    public enum Spacing {
        public static let s1: CGFloat = 4, s2: CGFloat = 8, s3: CGFloat = 12, s4: CGFloat = 16
        public static let s5: CGFloat = 20, s6: CGFloat = 24, s7: CGFloat = 32
        public static let pageX: CGFloat = 16
        public static let touch: CGFloat = 44
        public static let buttonHeight: CGFloat = 52
        public static let progress: CGFloat = 8
        public static let icon: CGFloat = 24
        public static let cardMinWidth: CGFloat = 150
        public static let hairline: CGFloat = 1
    }

    public enum Radius {
        public static let small: CGFloat = 16
        public static let card: CGFloat = 20
        public static let hero: CGFloat = 26
        public static let pill: CGFloat = 999
    }

    public enum Colors {
        // السمة «أخضر عاجي» (مرجع design/Themes) — الليلي بحسب أمر 14 أكتوبر 2026.
        public static let bg = dynamic(light: 0xF7F4EC, dark: 0x0F1A15)
        public static let surface = dynamic(light: 0xFFFFFF, dark: 0x17251E)
        public static let surface2 = dynamic(light: 0xF2ECDD, dark: 0x1E2E26)
        public static let border = dynamic(light: 0xE6DFCF, dark: 0x23332B)
        public static let beige = dynamic(light: 0xEFE6D4, dark: 0x1E2E26)
        public static let primary = dynamic(light: 0x1F5C46, dark: 0x6FBE9C)
        public static let primaryStrong = dynamic(light: 0x123B2C, dark: 0x1F5C46)
        public static let primarySoft = dynamic(light: 0xE9F0EA, dark: 0x1B2F26)
        /// ذهبي للنصوص، وذهبي للزخرفة، وذهبي فاتح (أزرار ثانوية).
        public static let gold = dynamic(light: 0x8A6D32, dark: 0xD9C089)
        /// لون محيط صفحة المصحف (ترويسة، علامة نهاية الآية، الصفحة): أخضر هادئ؛ الداكن درجة أفتح بتباين ≥ 4.5:1.
        public static let mushafAccent = dynamic(light: 0x5C8A72, dark: 0x8FBFA6)
        public static let goldDeco = dynamic(light: 0xB08D4A, dark: 0xD9C089)
        public static let goldSoft = dynamic(light: 0xD9C089, dark: 0x3A3320)
        public static let textPrimary = dynamic(light: 0x17241E, dark: 0xEFECE2)
        public static let textSecondary = dynamic(light: 0x5B6660, dark: 0xBDB9AA)
        public static let textOnPrimary = dynamic(light: 0xF7F4EC, dark: 0xF4F1E8)
        public static let danger = dynamic(light: 0xB0352B, dark: 0xEF8B80)
        /// مفتاح مطفأ (Toggle).
        public static let switchOff = dynamic(light: 0xD8D2C4, dark: 0x2B3B33)

        private static func dynamic(light: UInt32, dark: UInt32) -> Color {
            #if canImport(UIKit)
            Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
            #else
            Color(NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? NSColor(hex: dark) : NSColor(hex: light) })
            #endif
        }
    }

    /// حركة خفيفة تحترم «تقليل الحركة»، وارتجاج لمسي موحّد.
    public enum Motion {
        public static var reduced: Bool {
            #if canImport(UIKit)
            UIAccessibility.isReduceMotionEnabled
            #else
            false
            #endif
        }
        public static let standard = Animation.easeInOut(duration: 0.2)
    }

    @MainActor public enum Haptics {
        public static func select() {
            #if canImport(UIKit) && !os(watchOS)
            UISelectionFeedbackGenerator().selectionChanged()
            #endif
        }
    }

    /// 6 مستويات فقط، مرتبطة بـ Dynamic Type.
    public enum Typography {
        public static let pageTitle = Font.custom("Almarai-ExtraBold", size: 28, relativeTo: .title)
        public static let sectionTitle = Font.custom("Almarai-Bold", size: 20, relativeTo: .title3)
        public static let cardTitle = Font.custom("Almarai-Bold", size: 17, relativeTo: .headline)
        public static let body = Font.custom("Almarai-Regular", size: 16, relativeTo: .body)
        public static let secondary = Font.custom("Almarai-Regular", size: 14, relativeTo: .subheadline)
        public static let tag = Font.custom("Almarai-Bold", size: 12, relativeTo: .caption)
        /// نصوص شرعية بخط Amiri: الآية والحديث/الأثر (خط المصحف QPC غير مضمَّن بانتظار قرار الترخيص).
        public static let quran = Font.custom("Amiri-Regular", size: 24, relativeTo: .title3)
        /// القراءة الطويلة (أحاديث، شروح، مقالات): Noto Naskh Arabic.
        public static let hadith = Font.custom("NotoNaskhArabic-Regular", size: 19, relativeTo: .body)
        public static let reading = Font.custom("NotoNaskhArabic-Regular", size: 18, relativeTo: .body)
        public static let readingBold = Font.custom("NotoNaskhArabic-Bold", size: 18, relativeTo: .body)
    }
}

/// يُنفّذ التغيير بحركة قياسية، أو فورًا عند تفعيل «تقليل الحركة».
@discardableResult
public func sunnahAnimate<R>(_ body: () throws -> R) rethrows -> R {
    try withAnimation(Sunnah.Motion.reduced ? nil : Sunnah.Motion.standard, body)
}

public extension View {
    /// ظل البطاقة: خفيف في الفاتح، بلا ظل في الداكن (الحدّ يكفي).
    func sunnahElevation() -> some View { modifier(SunnahElevation()) }
}

private struct SunnahElevation: ViewModifier {
    @Environment(\.colorScheme) private var scheme
    func body(content: Content) -> some View {
        content.shadow(color: scheme == .dark ? .clear : .black.opacity(0.06), radius: 8, y: 2)
    }
}

#if canImport(UIKit)
private extension UIColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
    }
}
#else
private extension NSColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
    }
}
#endif
