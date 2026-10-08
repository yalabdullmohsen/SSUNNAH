import Foundation
import SwiftUI
import UIKit
import SunnahDataKit
import SunnahNative
import SunnahPrayer
import SunnahWeb

/// مفتاح تشغيل الصدفة الأصلية (SwiftUI). مطفأ افتراضيًا: لا يتغيّر سلوك التطبيق ما لم يُفعَّل صراحةً.
/// الرجوع = إطفاء المفتاح؛ يعود الإقلاع التالي إلى CAPBridgeViewController من Main.storyboard.
enum NativeShellGate {
    static let defaultsKey = "native_shell_enabled"

    static var isEnabled: Bool {
        UserDefaults.standard.bool(forKey: defaultsKey)
    }

    /// يستبدل جذر النافذة بالصدفة الأصلية عند تفعيل المفتاح؛ وإلا لا يمس شيئًا.
    @MainActor
    static func installIfEnabled(in window: UIWindow?) {
        guard isEnabled, let window else { return }
        window.rootViewController = UIHostingController(rootView: NativeShellRoot())
        window.makeKeyAndVisible()
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
