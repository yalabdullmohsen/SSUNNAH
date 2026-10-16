#if canImport(UserNotifications) && os(iOS)
import Foundation
import UserNotifications

/// مندوب الإشعارات الخاص بنا: يعرض إشعاراتنا والتطبيق مفتوح، ويحوّل النقر إلى مسار.
/// ما ليس لنا (Capacitor/الويب) يُمرَّر إلى المندوب السابق دون مساس.
public final class NativeNotificationCenterDelegate: NSObject, UNUserNotificationCenterDelegate {
    public static let shared = NativeNotificationCenterDelegate()
    /// مسار نقر وصل قبل أن تُركَّب الواجهة (إطلاق بارد)؛ تستهلكه الواجهة مرة واحدة.
    public private(set) static var pendingRoute: String?
    private weak var previous: UNUserNotificationCenterDelegate?

    public static func takePendingRoute() -> String? {
        defer { pendingRoute = nil }
        return pendingRoute
    }

    /// آمن التكرار: يُستدعى بعد إنشاء جسر Capacitor وعند كل تنشيط.
    public static func install(center: UNUserNotificationCenter = .current()) {
        if center.delegate === shared { return }
        shared.previous = center.delegate
        center.delegate = shared
    }

    public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
                                       withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if NotificationRouting.path(forIdentifier: notification.request.identifier) != nil {
            completionHandler([.banner, .list, .sound])
        } else if let previous, previous.responds(to: #selector(UNUserNotificationCenterDelegate.userNotificationCenter(_:willPresent:withCompletionHandler:))) {
            previous.userNotificationCenter?(center, willPresent: notification, withCompletionHandler: completionHandler)
        } else {
            completionHandler([])
        }
    }

    public func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
                                       withCompletionHandler completionHandler: @escaping () -> Void) {
        let request = response.notification.request
        if response.actionIdentifier == UNNotificationDefaultActionIdentifier,
           let path = NotificationRouting.resolve(identifier: request.identifier, userInfo: request.content.userInfo) {
            Self.deliver(path)
            completionHandler()
        } else if let previous, previous.responds(to: #selector(UNUserNotificationCenterDelegate.userNotificationCenter(_:didReceive:withCompletionHandler:))) {
            previous.userNotificationCenter?(center, didReceive: response, withCompletionHandler: completionHandler)
        } else {
            completionHandler()
        }
    }

    static func deliver(_ path: String) {
        let post = {
            pendingRoute = path
            NotificationCenter.default.post(name: NotificationRouting.openRouteName, object: nil, userInfo: [NotificationRouting.routeKey: path])
        }
        if Thread.isMainThread { post() } else { DispatchQueue.main.async(execute: post) }
    }
}
#endif
