#if os(iOS)
import BackgroundTasks
import Foundation

/// يمد نافذة الإشعارات دون فتح التطبيق. يُسجَّل من AppDelegate قبل انتهاء الإطلاق،
/// ويتطلب المعرّف في BGTaskSchedulerPermittedIdentifiers داخل Info.plist (يُضاف مع ربط الحزمة).
public enum PrayerBackgroundRefresh {
    public static let taskIdentifier = "com.yousef.majlisilm.prayer-refresh"
    /// يكفي يوميًا مرة؛ النافذة 7 أيام فالتأخير لا يُفقد إشعارًا.
    static let interval: TimeInterval = 12 * 3600

    /// التسجيل بلا المعرّف في Info.plist يُسقط التطبيق، فلا نسجّل إلا إن وُجد.
    public static var isPermitted: Bool {
        (Bundle.main.object(forInfoDictionaryKey: "BGTaskSchedulerPermittedIdentifiers") as? [String])?.contains(taskIdentifier) == true
    }

    public static func register() {
        guard isPermitted else { return }
        BGTaskScheduler.shared.register(forTaskWithIdentifier: taskIdentifier, using: nil) { task in
            guard let task = task as? BGAppRefreshTask else { return }
            handle(task)
        }
    }

    public static func schedule() {
        let request = BGAppRefreshTaskRequest(identifier: taskIdentifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: interval)
        try? BGTaskScheduler.shared.submit(request)
    }

    static func handle(_ task: BGAppRefreshTask) {
        schedule()
        let work = Task {
            await NativeNotifications.rescheduleAll()
            task.setTaskCompleted(success: !Task.isCancelled)
        }
        task.expirationHandler = { work.cancel() }
    }
}
#endif
