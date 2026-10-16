import SwiftUI

/// هوية سُنّة على الساعة: زمردي وذهبي بلا لون حرفي خارج هذا الملف. التباين ≥ 4.5:1 للنص على الخلفية الزمردية.
enum WatchTheme {
    static let emeraldDeep = Color(red: 0x0B / 255, green: 0x4D / 255, blue: 0x35 / 255)
    static let emerald = Color(red: 0x0E / 255, green: 0x6E / 255, blue: 0x52 / 255)
    static let emeraldDark = Color(red: 0x13 / 255, green: 0x3D / 255, blue: 0x2A / 255)
    static let gold = Color(red: 0xD4 / 255, green: 0xAF / 255, blue: 0x6A / 255)
    static let alert = Color(red: 1.0, green: 0.78, blue: 0.36)
    static let textPrimary = Color.white
    static let textSecondary = Color.white.opacity(0.82)
    static let raised = Color.white.opacity(0.12)

    /// ليلي: الساعة داكنة أصلًا، فتُعمَّق الخلفية بدل إضاءتها.
    static func background(_ scheme: ColorScheme) -> LinearGradient {
        LinearGradient(colors: scheme == .dark ? [emeraldDark, .black] : [emerald, emeraldDark],
                       startPoint: .top, endPoint: .bottom)
    }
}

extension View {
    /// RTL كامل وأرقام لاتينية على الساعة.
    func watchRTL() -> some View {
        self.environment(\.layoutDirection, .rightToLeft)
            .environment(\.locale, Locale(identifier: "ar-u-nu-latn"))
    }
}
