import SwiftUI
import SunnahPrayer

/// شاشة المواقيت: تغليف مباشر للشاشة الأصلية دون إعادة كتابة؛ الحساب من المحرك فقط.
public struct PrayerScreen: View {
    public init() {}
    public var body: some View {
        PrayerTimesScreen()
            .environment(\.prayerTimesTheme, PrayerTimesTheme(background: Sunnah.Colors.bg, rowBackground: Sunnah.Colors.surface))
    }
}
