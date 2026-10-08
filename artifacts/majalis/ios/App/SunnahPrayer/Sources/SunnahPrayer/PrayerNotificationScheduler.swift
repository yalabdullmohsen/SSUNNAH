#if canImport(UserNotifications)
import Foundation
import UserNotifications

/// يحوّل خطة الإشعارات إلى طلبات iOS. حين يُفعَّل native_shell_enabled يصبح هذا المصدر الوحيد
/// لإشعارات الصلاة، فلا يُجدول الويب نسخة مكررة.
public enum PrayerNotificationScheduler {
    static let lastRescheduleKey = "sunnah.prayer.notifications.lastReschedule"

    /// يلغي إشعارات الصلاة المعلّقة (ببادئتنا فقط) ثم يجدول النافذة من جديد. يعيد عدد المجدول.
    @discardableResult
    public static func reschedule(
        center: UNUserNotificationCenter = .current(),
        defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard,
        now: Date = Date()
    ) async -> Int {
        let prefs = PrayerPreferencesStore.read(from: defaults) ?? PrayerPreferences()
        let options = PrayerNotificationOptions.read(from: defaults)
        let pending = await center.pendingNotificationRequests()
        let ours = pending.map(\.identifier).filter { $0.hasPrefix(PrayerNotificationPlanner.idPrefix) }
        center.removePendingNotificationRequests(withIdentifiers: ours)

        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional else { return 0 }

        // لا نتجاوز حد iOS حتى لو زادت إشعارات الأذكار عن حصتها.
        let others = pending.count - ours.count
        let share = max(0, min(PrayerNotificationBudget.prayerShare, PrayerNotificationBudget.iosPendingLimit - others))
        let planned = PrayerNotificationPlanner.plan(location: prefs.location, settings: prefs.settings,
                                                     options: options, now: now, share: share)
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = prefs.location.timeZone
        var added = 0
        for item in planned {
            let content = UNMutableNotificationContent()
            content.title = item.title
            content.body = item.body
            content.sound = UNNotificationSound(named: UNNotificationSoundName(item.sound))
            content.threadIdentifier = "prayer"
            content.interruptionLevel = .timeSensitive
            let parts = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: item.fireDate)
            let trigger = UNCalendarNotificationTrigger(dateMatching: parts, repeats: false)
            do {
                try await center.add(UNNotificationRequest(identifier: item.id, content: content, trigger: trigger))
                added += 1
            } catch {
                continue
            }
        }
        defaults.set(now.timeIntervalSince1970, forKey: lastRescheduleKey)
        return added
    }

    /// آخر إعادة جدولة — للتحقق من عمل التحديث في الخلفية.
    public static func lastReschedule(defaults: UserDefaults = UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard) -> Date? {
        let t = defaults.double(forKey: lastRescheduleKey)
        return t > 0 ? Date(timeIntervalSince1970: t) : nil
    }
}
#endif
