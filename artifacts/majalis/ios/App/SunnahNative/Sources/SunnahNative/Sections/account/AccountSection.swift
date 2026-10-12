import SwiftUI

/// قسم «الحساب والإعدادات». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:)) بمعرّف = المسار بلا `/`،
/// و/updates/auto/:slug تُحلّ بـresolve. الربط في GeneratedScreens/نقطة الدخول ملف مشترك — مطلوب في docs/native/requests/account.md.
public enum AccountSection {
    /// معرّفات الشاشات المسجّلة (18 + updates/auto/:slug عبر resolve = 19).
    public static let ids = [
        "about", "calendar", "car-mode", "contact", "data-licenses", "fatwa-policy", "feature-tour", "islam-stats",
        "mosque-mode", "my-submissions", "notification-settings", "offline", "privacy", "privacy-center", "qibla",
        "stats", "submit", "updates", "widget-center",
    ]

    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "about") { AccountAboutScreen() }
        registry.registerView(id: "calendar") { AccountCalendarScreen() }
        registry.registerView(id: "car-mode") { AccountCarModeScreen() }
        registry.registerView(id: "contact") { AccountContactScreen() }
        registry.registerView(id: "data-licenses") { AccountDataLicensesScreen() }
        registry.registerView(id: "fatwa-policy") { AccountFatwaPolicyScreen() }
        registry.registerView(id: "feature-tour") { AccountFeatureTourScreen() }
        registry.registerView(id: "islam-stats") { AccountIslamStatsScreen() }
        registry.registerView(id: "mosque-mode") { AccountMosqueModeScreen() }
        registry.registerView(id: "my-submissions") { AccountMySubmissionsScreen() }
        registry.registerView(id: "notification-settings") { AccountNotificationSettingsScreen() }
        registry.registerView(id: "offline") { AccountOfflineCenterScreen() }
        registry.registerView(id: "privacy") { AccountPrivacyScreen() }
        registry.registerView(id: "privacy-center") { AccountPrivacyCenterScreen() }
        registry.registerView(id: "qibla") { AccountQiblaScreen() }
        registry.registerView(id: "stats") { AccountUserStatsScreen() }
        registry.registerView(id: "submit") { AccountSubmitContentScreen() }
        registry.registerView(id: "updates") { AccountUpdatesScreen() }
        registry.registerView(id: "widget-center") { AccountWidgetCenterScreen() }
    }

    /// يحوّل مكوّنات المسار إلى شاشة ذات معامل، أو nil.
    public static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 3, c[0] == "updates", c[1] == "auto", !c[2].isEmpty {
            return AnyView(AccountAutoContentDetailScreen(slug: c[2].removingPercentEncoding ?? c[2]))
        }
        return nil
    }
}
