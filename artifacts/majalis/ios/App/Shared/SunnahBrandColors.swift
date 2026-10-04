import SwiftUI

/// ألوان هوية سُنّة المشتركة — تطابق تدرّج شريط الصلاة / Live Activity
/// (index.css / elite-2026.css). لا نظام تصميم منفصل للودجت.
enum SunnahBrandColors {
    static let emeraldDeep = Color(red: 0x0B / 255, green: 0x4D / 255, blue: 0x35 / 255)
    static let emerald = Color(red: 0x0E / 255, green: 0x6E / 255, blue: 0x52 / 255)
    static let emeraldDark = Color(red: 0x13 / 255, green: 0x3D / 255, blue: 0x2A / 255)
    static let gold = Color(red: 0xD4 / 255, green: 0xAF / 255, blue: 0x6A / 255)
}

/// Native SwiftUI mapping of the Sunnah design authority. CSS variables are not imported.
enum SunnahWidgetTheme {
    static let emeraldIdentity = SunnahBrandColors.emerald
    static let goldAccent = SunnahBrandColors.gold
    static let primaryText = Color.white
    static let secondaryText = Color.white.opacity(0.82)
    static let tertiaryText = Color.white.opacity(0.62)
    static let baseSurface = SunnahBrandColors.emeraldDark
    static let raisedSurface = Color.white.opacity(0.10)
    static let focusFill = SunnahBrandColors.emerald.opacity(0.45)
    static let selectedFill = SunnahBrandColors.gold.opacity(0.22)
    static let warningFill = Color(red: 0.72, green: 0.45, blue: 0.12)
    static let errorFill = Color(red: 0.62, green: 0.18, blue: 0.16)
    static let infoFill = SunnahBrandColors.emerald
    static let spacingXS: CGFloat = 4
    static let spacingSM: CGFloat = 8
    static let spacingMD: CGFloat = 12
    static let spacingLG: CGFloat = 16
    static let radiusSM: CGFloat = 8
    static let radiusMD: CGFloat = 12
    static let iconSM: CGFloat = 12
    static let iconMD: CGFloat = 16
    static let titleFont: Font = .headline.bold()
    static let bodyFont: Font = .subheadline.bold()
    static let captionFont: Font = .caption.bold()
    static let countdownFont: Font = .title3.monospacedDigit().bold()

    static var homeGradient: LinearGradient {
        LinearGradient(
            colors: [SunnahBrandColors.emerald, SunnahBrandColors.emeraldDark],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var homeGradientDeep: LinearGradient {
        LinearGradient(
            colors: [SunnahBrandColors.emeraldDeep, SunnahBrandColors.emeraldDark],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}
