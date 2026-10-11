import SwiftUI

/// تسجيل الشاشات الخاصة؛ تُستدعى من جذر التطبيق إلى جانب `registerAll` للقوالب.
public enum SpecialScreens {
    @MainActor
    public static func registerAll(in registry: TemplateRegistry) {
        registry.register(AdhkarScreen.self)
        HadithScreens.register(in: registry)
        AdhkarExtraScreens.register(in: registry)
        AccountScreens.register(in: registry)
        SettingsScreens.register(in: registry)
        registry.registerView(id: "prayer") { PrayerScreen() }
        registry.registerView(id: "home") { HomeScreen() }
        registry.registerView(id: "quran") { MushafScreen() }
        registry.registerView(id: "quran-hub") { MushafScreen() }
        registry.registerView(id: "mushaf") { MushafScreen() }
    }
}
