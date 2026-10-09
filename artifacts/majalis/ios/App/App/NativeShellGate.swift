import Foundation
import SwiftUI
import UIKit
import SunnahDataKit
import SunnahNative
import SunnahPrayer
import SunnahWeb

/// مفتاح تشغيل الصدفة الأصلية (SwiftUI). مطفأ افتراضيًا: لا يتغيّر سلوك التطبيق ما لم يُفعَّل صراحةً.
/// الرجوع = إطفاء المفتاح (رابط majlisilm://native-shell في بناء TestFlight)؛ يعود الجذر إلى CAPBridgeViewController من Main.storyboard.
enum NativeShellGate {
    static let defaultsKey = "native_shell_enabled"

    /// القيمة الافتراضية المجمَّعة في البناء. تبقى false حتى قرار الشحن (12 أكتوبر)؛ يقلبها PR الـRC وحده.
    static let compiledDefault = false

    /// مفتاح الإيقاف عن بُعد: `{"enabled": false}` في native-shell.json يعطّل الصدفة والإشعارات الأصلية
    /// في الجلسة التالية حتى لو فُعِّلت صراحةً. غياب الملف أو فشل الشبكة لا يغيّر شيئًا (آخر قيمة مخزّنة).
    static let remoteKey = "native_shell_remote_enabled"
    static let remoteURL = URL(string: "https://www.ssunnah.com/native-shell.json")!

    /// أولوية: الإيقاف عن بُعد ← اختيار الجهاز الصريح (اختبار) ← القيمة المجمَّعة.
    static var isEnabled: Bool {
        let d = UserDefaults.standard
        if let remote = d.object(forKey: remoteKey) as? Bool, !remote { return false }
        if let explicit = d.object(forKey: defaultsKey) as? Bool { return explicit }
        return compiledDefault
    }

    /// يجلب مفتاح الإيقاف ويخزّنه؛ يُستدعى عند الإطلاق والتفعيل.
    static func refreshRemoteSwitch() {
        var request = URLRequest(url: remoteURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 8)
        request.httpMethod = "GET"
        URLSession.shared.dataTask(with: request) { data, response, _ in
            guard let data, (response as? HTTPURLResponse)?.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let enabled = json["enabled"] as? Bool else { return }
            UserDefaults.standard.set(enabled, forKey: remoteKey)
        }.resume()
    }

    /// يستبدل جذر النافذة بالصدفة الأصلية عند تفعيل المفتاح؛ وإلا لا يمس شيئًا.
    @MainActor
    static func installIfEnabled(in window: UIWindow?) {
        guard isEnabled, let window else { return }
        window.rootViewController = UIHostingController(rootView: NativeShellRoot())
        window.makeKeyAndVisible()
    }

    /// مفتاح الاختبار المخفي متاح في بناءات TestFlight وDebug فقط؛ نسخة المتجر لا ترى شيئًا.
    static var isTesterBuild: Bool {
        #if DEBUG
        return true
        #else
        return Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt"
        #endif
    }

    /// رابط الاختبار: `majlisilm://native-shell?enabled=1|0` (بلا enabled = تبديل).
    /// يُستدعى من زر صفحة /debug/tasmee أو من Safari. في نسخة المتجر يُترك لـCapacitor كما كان.
    /// أي تطبيق أو صفحة تستطيع فتح الرابط، لذا لا يُبدَّل شيء إلا بعد تنبيه تأكيد.
    @MainActor
    static func handle(_ url: URL, in window: UIWindow?) -> Bool {
        guard url.scheme?.lowercased() == "majlisilm", url.host?.lowercased() == "native-shell",
              isTesterBuild, let window else { return false }
        let requested = URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?.first(where: { $0.name == "enabled" })?.value
        let target = requested.map { $0 == "1" || $0 == "true" } ?? !isEnabled
        presentConfirmation(enable: target, from: window)
        return true
    }

    @MainActor
    private static func presentConfirmation(enable: Bool, from window: UIWindow) {
        var top = window.rootViewController
        while let presented = top?.presentedViewController { top = presented }
        guard let top, !(top is UIAlertController) else { return }
        let current = isEnabled ? "مفعّلة" : "مطفأة"
        let alert = UIAlertController(
            title: "الواجهة الأصلية (اختبار)",
            message: "الحالة الآن: \(current). هل تريد \(enable ? "تفعيلها" : "إيقافها") على هذا الجهاز؟",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: enable ? "تفعيل" : "إيقاف", style: .default) { _ in
            UserDefaults.standard.set(enable, forKey: defaultsKey)
            applyCurrent(in: window)
        })
        alert.addAction(UIAlertAction(title: "إلغاء", style: .cancel))
        top.present(alert, animated: true)
    }

    /// يبدّل جذر النافذة حسب المفتاح: الصدفة الأصلية، أو CAPBridgeViewController من Main.storyboard.
    @MainActor
    private static func applyCurrent(in window: UIWindow) {
        if isEnabled {
            window.rootViewController = UIHostingController(rootView: NativeShellRoot())
        } else if let bridge = UIStoryboard(name: "Main", bundle: nil).instantiateInitialViewController() {
            window.rootViewController = bridge
        }
    }
}

/// الجذر الأصلي: المواقيت أصلية، وكل مسار لم يُحوَّل يُعرض في WebScreen بالمسار نفسه.
struct NativeShellRoot: View {
    @StateObject private var router = AppRouter()

    var body: some View {
        RootTabView(router: router, screen: screen)
    }

    private func screen(_ route: Route) -> AnyView {
        switch Route.normalize(route.path) {
        case AppTab.prayer.rootPath:
            return AnyView(PrayerTimesScreen())
        default:
            return AnyView(
                WebScreen(
                    path: route.path,
                    onPush: { router.open(path: $0) }
                )
                .navigationTitle(AppTab.owning(path: route.path).title)
                .navigationBarTitleDisplayMode(.inline)
            )
        }
    }
}
