import Foundation
import UserNotifications

/// إشعارات الساعة المحلية: تستهلك أذانات المحرك من الحمولة كما هي (لا حساب مواقيت هنا).
enum WatchNotifications {
    private static let prefix = "sunnah.watch.prayer."
    private static let adhkarPrefix = "sunnah.watch.adhkar."

    static func requestAuthorization() async {
        _ = try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound])
    }

    static func reschedule(from p: WatchPayload) async {
        let center = UNUserNotificationCenter.current()
        let pending = await center.pendingNotificationRequests().map(\.identifier).filter { $0.hasPrefix(prefix) || $0.hasPrefix(adhkarPrefix) }
        center.removePendingNotificationRequests(withIdentifiers: pending)
        let now = Date()
        for pr in p.prayers.filter({ $0.isFard && $0.date > now }).prefix(20) {
            let c = UNMutableNotificationContent()
            c.title = pr.nameAr
            c.body = "حان وقت صلاة \(pr.nameAr)"
            c.sound = .default
            c.threadIdentifier = "prayer"
            let comps = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: pr.date)
            try? await center.add(UNNotificationRequest(identifier: prefix + pr.id, content: c, trigger: UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)))
        }
        // تذكير الأذكار: بعد الفجر بنصف ساعة (صباح) وبعد العصر بنصف ساعة (مساء) إن توفرت المجموعة.
        for (setId, prayerKey) in [("morning", "fajr"), ("evening", "asr")] {
            guard let set = p.adhkar.first(where: { $0.id == setId }) else { continue }
            for pr in p.prayers.filter({ $0.key == prayerKey && $0.date > now }).prefix(3) {
                let fire = pr.date.addingTimeInterval(30 * 60)
                let c = UNMutableNotificationContent()
                c.title = set.titleAr
                c.sound = .default
                c.threadIdentifier = "adhkar"
                let comps = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: fire)
                try? await center.add(UNNotificationRequest(identifier: adhkarPrefix + setId + pr.id, content: c, trigger: UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)))
            }
        }
    }
}
