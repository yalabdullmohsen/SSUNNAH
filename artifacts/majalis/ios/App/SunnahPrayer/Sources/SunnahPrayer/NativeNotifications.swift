#if canImport(UserNotifications)
import Foundation
import UserNotifications

/// المُجدول الموحّد للمجموعات الخمس. الصلاة تمر عبر PrayerNotificationScheduler دون تغيير في منطقها،
/// ثم تملأ الأذكار والورد والتذكير الدوري والمناسبات السعة الباقية حتى لا يتجاوز المعلّق 64.
public enum NativeNotifications {
    static var ourPrefixes: [String] { [PrayerNotificationPlanner.idPrefix, GeneralNotificationPlanner.idPrefix] }

    @discardableResult
    public static func rescheduleAll(
        center: UNUserNotificationCenter = .current(),
        defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard,
        now: Date = Date()
    ) async -> (prayer: Int, general: Int) {
        let isGeneral: (String) -> Bool = { $0.hasPrefix(GeneralNotificationPlanner.idPrefix) }
        let options = GeneralNotificationOptions.read(from: defaults)
        let legacy = LegacyWebNotifications.identifiers(replacedBy: options)
        let before = await center.pendingNotificationRequests()
        center.removePendingNotificationRequests(
            withIdentifiers: before.map(\.identifier).filter { isGeneral($0) || legacy.contains($0) })

        let prayer = await PrayerNotificationScheduler.reschedule(center: center, defaults: defaults, now: now)
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional else { return (prayer, 0) }

        let used = await center.pendingNotificationRequests().filter { !isGeneral($0.identifier) }.count
        let prefs = PrayerPreferencesStore.read(from: defaults) ?? PrayerPreferences()
        let planned = GeneralNotificationPlanner.plan(
            location: prefs.location, settings: prefs.settings,
            options: options,
            events: NotificationEvent.read(from: defaults), now: now,
            capacity: max(0, PrayerNotificationBudget.iosPendingLimit - used))

        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = prefs.location.timeZone
        var added = 0
        for item in planned {
            let content = UNMutableNotificationContent()
            content.title = item.title
            content.body = item.body
            content.sound = .default
            content.threadIdentifier = item.group.rawValue
            let parts = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: item.fireDate)
            let trigger = UNCalendarNotificationTrigger(dateMatching: parts, repeats: false)
            do {
                try await center.add(UNNotificationRequest(identifier: item.id, content: content, trigger: trigger))
                added += 1
            } catch {
                continue
            }
        }
        return (prayer, added)
    }

    /// يزيل كل ما جدولته الصدفة الأصلية فقط (عند إطفائها) دون مس إشعارات الويب.
    public static func removeAll(center: UNUserNotificationCenter = .current()) async {
        let ids = await center.pendingNotificationRequests().map(\.identifier)
            .filter { id in ourPrefixes.contains { id.hasPrefix($0) } }
        center.removePendingNotificationRequests(withIdentifiers: ids)
    }
}

#if os(iOS)
/// ربط دورة حياة التطبيق: يُستدعى من AppDelegate بحالة native_shell_enabled.
public enum NativeNotificationsLifecycle {
    static var backgroundRegistered = false

    /// قبل انتهاء الإطلاق: تسجيل BGTask فقط إن كانت الصدفة مفعّلة والمعرّف مسجلًا في Info.plist.
    public static func didFinishLaunching(nativeShellEnabled: Bool) {
        guard nativeShellEnabled, PrayerBackgroundRefresh.isPermitted, !backgroundRegistered else { return }
        PrayerBackgroundRefresh.register()
        backgroundRegistered = true
    }

    public static func didBecomeActive(nativeShellEnabled: Bool) {
        guard nativeShellEnabled else {
            Task { await NativeNotifications.removeAll() }
            return
        }
        Task { await NativeNotifications.rescheduleAll() }
        if backgroundRegistered { PrayerBackgroundRefresh.schedule() }
    }
}
#endif
#endif
