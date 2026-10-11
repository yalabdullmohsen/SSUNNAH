import SwiftUI

/// تسجيل الشاشات الخاصة؛ تُستدعى من جذر التطبيق إلى جانب `registerAll` للقوالب.
public enum SpecialScreens {
    @MainActor
    public static func registerAll(in registry: TemplateRegistry) {
        registry.register(AdhkarScreen.self)
        registry.register(OfflineAudioScreen.self)
        registry.registerView(id: "prayer") { PrayerScreen() }
        registry.registerView(id: "home") { HomeScreen() }
    }
}
