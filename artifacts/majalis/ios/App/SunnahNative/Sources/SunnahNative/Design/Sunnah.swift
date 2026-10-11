import SwiftUI

/// رموز «سُنّة» البصرية للحزمة — مطابقة لـ App/Design/SunnahTokens.swift. المصدر الوحيد للقيم في Templates/Components/Generated.
public enum Sunnah {
    public enum Spacing {
        public static let s1: CGFloat = 4, s2: CGFloat = 8, s3: CGFloat = 12, s4: CGFloat = 16
        public static let s5: CGFloat = 20, s6: CGFloat = 24, s7: CGFloat = 32
        public static let pageX: CGFloat = 16
        public static let touch: CGFloat = 44
        public static let buttonHeight: CGFloat = 48
        public static let progress: CGFloat = 8
        public static let icon: CGFloat = 24
        public static let cardMinWidth: CGFloat = 150
        public static let hairline: CGFloat = 1
    }

    public enum Radius {
        public static let small: CGFloat = 12
        public static let card: CGFloat = 16
        public static let hero: CGFloat = 20
        public static let pill: CGFloat = 999
    }

    public enum Colors {
        public static let bg = dynamic(light: 0xF8F6F1, dark: 0x141612)
        public static let surface = dynamic(light: 0xFFFFFF, dark: 0x1C1F19)
        public static let surface2 = dynamic(light: 0xF1EEE6, dark: 0x252922)
        public static let primary = dynamic(light: 0x0F5C3F, dark: 0x66C29B)
        public static let primaryStrong = dynamic(light: 0x0A3F2C, dark: 0x1C5C43)
        public static let primarySoft = dynamic(light: 0xE3EFE9, dark: 0x1F3A2E)
        public static let textPrimary = dynamic(light: 0x15271F, dark: 0xEFECE2)
        public static let textSecondary = dynamic(light: 0x4B5A52, dark: 0xBDB9AA)
        public static let textOnPrimary = dynamic(light: 0xFFFFFF, dark: 0xF4F1E8)
        public static let danger = dynamic(light: 0xB0352B, dark: 0xEF8B80)

        private static func dynamic(light: UInt32, dark: UInt32) -> Color {
            #if canImport(UIKit)
            Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
            #else
            Color(NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? NSColor(hex: dark) : NSColor(hex: light) })
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
