import SwiftUI

/// رموز نظام «سُنّة» البصري — نسخة SwiftUI من src/design-system/design-system.css (المصدر الوحيد).
/// عند تغيير قيمة هناك غيّرها هنا؛ يحرس تطابقهما scripts/check-swift-tokens.mjs.
enum Sunnah {
    enum Spacing {
        static let s1: CGFloat = 4, s2: CGFloat = 8, s3: CGFloat = 12, s4: CGFloat = 16
        static let s5: CGFloat = 20, s6: CGFloat = 24, s7: CGFloat = 32
        static let pageX: CGFloat = 16
        static let touch: CGFloat = 44
        static let buttonHeight: CGFloat = 48
    }

    enum Radius {
        static let small: CGFloat = 12
        static let card: CGFloat = 16
        static let hero: CGFloat = 20
        static let pill: CGFloat = 999
    }

    enum Colors {
        static let bg = dynamic(light: 0xF8F6F1, dark: 0x141612)
        static let surface = dynamic(light: 0xFFFFFF, dark: 0x1C1F19)
        static let surface2 = dynamic(light: 0xF1EEE6, dark: 0x252922)
        static let primary = dynamic(light: 0x0F5C3F, dark: 0x66C29B)
        static let primaryStrong = dynamic(light: 0x0A3F2C, dark: 0x1C5C43)
        static let primarySoft = dynamic(light: 0xE3EFE9, dark: 0x1F3A2E)
        static let textPrimary = dynamic(light: 0x15271F, dark: 0xEFECE2)
        static let textSecondary = dynamic(light: 0x4B5A52, dark: 0xBDB9AA)
        static let textOnPrimary = dynamic(light: 0xFFFFFF, dark: 0xF4F1E8)
        static let danger = dynamic(light: 0xB0352B, dark: 0xEF8B80)

        private static func dynamic(light: UInt32, dark: UInt32) -> Color {
            Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
        }
    }

    /// سلّم الأحجام: 6 مستويات فقط، خط Almarai، مرتبطة بـ Dynamic Type.
    enum Typography {
        static let pageTitle = Font.custom("Almarai-ExtraBold", size: 28, relativeTo: .title)
        static let sectionTitle = Font.custom("Almarai-Bold", size: 20, relativeTo: .title3)
        static let cardTitle = Font.custom("Almarai-Bold", size: 17, relativeTo: .headline)
        static let body = Font.custom("Almarai-Regular", size: 16, relativeTo: .body)
        static let secondary = Font.custom("Almarai-Regular", size: 14, relativeTo: .subheadline)
        static let tag = Font.custom("Almarai-Bold", size: 12, relativeTo: .caption)
    }
}

private extension UIColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
    }
}
