// هذا الملف مولَّد من design-system.css — لا تعدّله يدويًا (node scripts/generate-swift-tokens.mjs).
import SwiftUI
import UIKit

public extension Color {
    init(light: UInt32, dark: UInt32) {
        self.init(UIColor { $0.userInterfaceStyle == .dark ? UIColor(rgba: dark) : UIColor(rgba: light) })
    }
}

extension UIColor {
    convenience init(rgba: UInt32) {
        self.init(red: CGFloat((rgba >> 24) & 0xFF) / 255, green: CGFloat((rgba >> 16) & 0xFF) / 255,
                  blue: CGFloat((rgba >> 8) & 0xFF) / 255, alpha: CGFloat(rgba & 0xFF) / 255)
    }
}

public enum DSColor {
    public static let bg = Color(light: 0xF8F6F1FF, dark: 0x141612FF)
    public static let surface = Color(light: 0xFFFFFFFF, dark: 0x1C1F19FF)
    public static let surface2 = Color(light: 0xF1EEE6FF, dark: 0x252922FF)
    public static let surfaceElevated = Color(light: 0xFFFFFFFF, dark: 0x2A2E26FF)
    public static let primary = Color(light: 0x0F5C3FFF, dark: 0x66C29BFF)
    public static let primaryStrong = Color(light: 0x0A3F2CFF, dark: 0x1C5C43FF)
    public static let primarySoft = Color(light: 0xE3EFE9FF, dark: 0x1F3A2EFF)
    public static let accent = Color(light: 0xA77F2EFF, dark: 0xD3AE5DFF)
    public static let textPrimary = Color(light: 0x15271FFF, dark: 0xEFECE2FF)
    public static let textSecondary = Color(light: 0x4B5A52FF, dark: 0xBDB9AAFF)
    public static let textTertiary = Color(light: 0x5F6D65FF, dark: 0x9A9688FF)
    public static let textOnPrimary = Color(light: 0xFFFFFFFF, dark: 0xF4F1E8FF)
    public static let separator = Color(light: 0xE4E0D3FF, dark: 0x33372EFF)
    public static let success = Color(light: 0x1C7A4DFF, dark: 0x6FCF9FFF)
    public static let warning = Color(light: 0x8F5F0AFF, dark: 0xE0B25AFF)
    public static let danger = Color(light: 0xB0352BFF, dark: 0xEF8B80FF)
    public static let textOnDanger = Color(light: 0xFFFFFFFF, dark: 0x1C0A08FF)
    public static let scrim = Color(light: 0x0C16117A, dark: 0x00000099)
    public static let focus = Color(light: 0x0F5C3FFF, dark: 0x66C29BFF)
    public static let onPrimarySoft = Color(light: 0xFFFFFF24, dark: 0xF4F1E81F)
}

public enum DSMetric {
    public static let fsLargeTitle: CGFloat = 34
    public static let lhLargeTitle: CGFloat = 1.2
    public static let fsTitle1: CGFloat = 28
    public static let lhTitle1: CGFloat = 1.25
    public static let fsTitle2: CGFloat = 22
    public static let lhTitle2: CGFloat = 1.3
    public static let fsTitle3: CGFloat = 20
    public static let lhTitle3: CGFloat = 1.35
    public static let fsHeadline: CGFloat = 17
    public static let lhHeadline: CGFloat = 1.4
    public static let fsBody: CGFloat = 16
    public static let lhBody: CGFloat = 1.55
    public static let fsCallout: CGFloat = 16
    public static let lhCallout: CGFloat = 1.5
    public static let fsSubhead: CGFloat = 14
    public static let lhSubhead: CGFloat = 1.5
    public static let fsFootnote: CGFloat = 13
    public static let lhFootnote: CGFloat = 1.45
    public static let fsCaption: CGFloat = 12
    public static let lhCaption: CGFloat = 1.4
    public static let fsHadith: CGFloat = 19
    public static let lhHadith: CGFloat = 2
    public static let fsHadithFeatured: CGFloat = 24
    public static let lhHadithFeatured: CGFloat = 1.9
    public static let fsAyah: CGFloat = 22
    public static let lhAyah: CGFloat = 2.1
    public static let fwRegular: CGFloat = 400
    public static let fwMedium: CGFloat = 400
    public static let fwSemibold: CGFloat = 700
    public static let fwBold: CGFloat = 700
    public static let fwHeavy: CGFloat = 800
    public static let s1: CGFloat = 4
    public static let s2: CGFloat = 8
    public static let s3: CGFloat = 12
    public static let s4: CGFloat = 16
    public static let s5: CGFloat = 20
    public static let s6: CGFloat = 24
    public static let s7: CGFloat = 32
    public static let s8: CGFloat = 40
    public static let pageX: CGFloat = 16
    public static let touch: CGFloat = 44
    public static let btnH: CGFloat = 48
    public static let rSm: CGFloat = 12
    public static let rMd: CGFloat = 12
    public static let rLg: CGFloat = 16
    public static let rXl: CGFloat = 20
    public static let rPill: CGFloat = 999
    public static let iconMd: CGFloat = 20
    public static let iconLg: CGFloat = 24
    public static let iconStroke: CGFloat = 1.75
    public static let hairline: CGFloat = 1
    public static let barH: CGFloat = 44
    public static let tabbarH: CGFloat = 56
    public static let contentMax: CGFloat = 640
    public static let zBar: CGFloat = 40
    public static let zSheet: CGFloat = 60
    public static let zToast: CGFloat = 80
    public static let pressScale: CGFloat = 1
}
// رموز غير رقمية/لونية لم تُولَّد (14): sn-text-on-fill, sn-type-page-title, sn-type-section-title, sn-type-card-title, sn-type-body, sn-type-secondary, sn-type-tag, sn-e1, sn-e2, sn-e3, sn-dur-fast, sn-dur-base, sn-dur-slow, sn-ease
