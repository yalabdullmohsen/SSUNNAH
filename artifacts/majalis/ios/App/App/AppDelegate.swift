import UIKit
import Capacitor
import AVFoundation
import WebKit
import SunnahPrayer

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Do not activate AVAudioSession at launch — plugins configure category on demand.
        _ = AppConfig.shared
        _ = NetworkService.shared
        purgeWebCachesOncePerAppBuild()
        NativeShellGate.installIfEnabled(in: window)
        NativeShellGate.refreshRemoteSwitch()
        NativeNotificationsLifecycle.didFinishLaunching(nativeShellEnabled: NativeShellGate.isEnabled)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMediaServicesReset),
            name: AVAudioSession.mediaServicesWereResetNotification,
            object: nil
        )
        return true
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    /// امسح كاش الشبكة وعمال الخدمة مرة واحدة لكل بناء تطبيق (لا localStorage/الكوكيز).
    /// المسح عند كل إقلاع كان يجعل كل فتح تنزيلًا كاملًا للحزم ويسابق التحميل الأول؛
    /// حداثة الموقع الحي مضمونة أصلًا بـ max-age=0 للمستند وأسماء أصول مُجزّأة.
    private func purgeWebCachesOncePerAppBuild() {
        let build = (Bundle.main.infoDictionary?["CFBundleVersion"] as? String) ?? ""
        let key = "mj.webCachePurgedForBuild"
        guard UserDefaults.standard.string(forKey: key) != build else { return }
        UserDefaults.standard.set(build, forKey: key)
        var cacheTypes: Set<String> = [
            WKWebsiteDataTypeDiskCache,
            WKWebsiteDataTypeMemoryCache,
            WKWebsiteDataTypeOfflineWebApplicationCache,
            WKWebsiteDataTypeFetchCache,
        ]
        if #available(iOS 16.4, *) {
            cacheTypes.insert(WKWebsiteDataTypeServiceWorkerRegistrations)
        }
        // يُنتظر اكتمال المسح قبل أن يبدأ تحميل الويب (وإلا مُسح الـCSS/الـJS أثناء التحميل الأول
        // فظهرت الصفحة خامة). المهلة قصوى حتى لا يتعلّق الإقلاع؛ تُدار الحلقة الرئيسة
        // لأن مُعالِج الاكتمال يُستدعى على الخيط الرئيسي (semaphore كان سيُجمّده).
        var done = false
        WKWebsiteDataStore.default().removeData(
            ofTypes: cacheTypes,
            modifiedSince: Date.distantPast
        ) { done = true }
        let deadline = Date().addingTimeInterval(Self.purgeTimeout)
        while !done && Date() < deadline {
            RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.01))
        }
        if !done { NSLog("[AppDelegate] web cache purge exceeded %.1fs — continuing launch", Self.purgeTimeout) }
    }

    /// المهلة القصوى لانتظار مسح كاش الويب عند أول تشغيل لبناء جديد.
    static let purgeTimeout: TimeInterval = 2.0

    @objc private func handleMediaServicesReset(_ notification: Notification) {
        NSLog("[AppDelegate] AVAudioSession media services were reset — WebView plugins must reconfigure")
        NotificationCenter.default.post(name: Notification.Name("MajlisMediaServicesReset"), object: nil)
    }

    func applicationWillResignActive(_ application: UIApplication) {
        NotificationCenter.default.post(name: Notification.Name("MajlisAppWillResignActive"), object: nil)
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        NotificationCenter.default.post(name: Notification.Name("MajlisAppDidEnterBackground"), object: nil)
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        NotificationCenter.default.post(name: Notification.Name("MajlisAppWillEnterForeground"), object: nil)
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        NotificationCenter.default.post(name: Notification.Name("MajlisAppDidBecomeActive"), object: nil)
        NativeNotificationsLifecycle.didBecomeActive(nativeShellEnabled: NativeShellGate.isEnabled)
    }

    func applicationWillTerminate(_ application: UIApplication) {
        NotificationCenter.default.removeObserver(self)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        if NativeShellGate.handle(url, in: window) { return true }
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // MARK: - APNs → Capacitor Push Notifications
    // Local Notifications remain primary for prayer / daily Quran schedules.
    // Remote Push is registered from JS via @capacitor/push-notifications.

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        NSLog("[MajlisAPNs] registered for remote notifications. length=%lu", UInt(token.count))
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
        NSLog("[MajlisAPNs] registration failed: %@", error.localizedDescription)
    }

}
