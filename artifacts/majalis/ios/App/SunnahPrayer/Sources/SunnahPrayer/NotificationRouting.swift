import Foundation

/// وجهة النقر على إشعار: معرّف الطلب ⇒ مسار تطبيق (من مسارات AppRouter). نقي وقابل للاختبار.
public enum NotificationRouting {
    public static let routeKey = "route"
    public static let openRouteName = Notification.Name("SunnahNotificationOpenRoute")

    /// يُكتب في userInfo عند الجدولة؛ يُرجع nil لما ليس لنا.
    public static func path(forIdentifier id: String, title: String = "") -> String? {
        if id.hasPrefix(PrayerNotificationPlanner.idPrefix) { return "/prayer-times" }
        guard id.hasPrefix(GeneralNotificationPlanner.idPrefix) else { return nil }
        let rest = id.dropFirst(GeneralNotificationPlanner.idPrefix.count)
        if rest.hasPrefix("adhkar.") || rest.hasPrefix("periodic.") { return "/adhkar" }
        if rest.hasPrefix("wird.") { return "/daily-wird" }
        if rest.hasPrefix("events.") {
            return rest.dropFirst("events.".count).lowercased().hasPrefix("jumu") ? "/jumuah" : "/lessons"
        }
        return nil
    }

    /// المسار المسموح بفتحه من userInfo (يبدأ بـ/ ولا يحوي مخططًا) وإلا يُشتق من المعرّف.
    public static func resolve(identifier: String, userInfo: [AnyHashable: Any]) -> String? {
        if let p = userInfo[routeKey] as? String, p.hasPrefix("/"), !p.contains("://"), !p.contains("..") { return p }
        return path(forIdentifier: identifier)
    }
}
