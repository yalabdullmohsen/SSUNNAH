import SwiftUI
import SunnahNative
import SunnahPrayer

/// نقطة دخول التطبيق الأصلي الصرف (بلا WebView ولا Capacitor).
/// Bundle ID: com.yousef.majlisilm — نفس سجل App Store. مشروع Xcode يملكه ن4.
@main
struct SunnahApp: App {
    @StateObject private var router = AppRouter()
    @Environment(\.scenePhase) private var scenePhase

    init() {
        SpecialScreens.registerAll(in: .shared)
        // نظام إشعارات واحد (الصلاة + الأذكار + الورد...) بموافقة المستخدم فقط؛ لا بوابة ويب في التطبيق الأصلي.
        NativeNotificationsLifecycle.didFinishLaunching(notificationsEnabled: true)
    }

    var body: some Scene {
        WindowGroup {
            RootTabView(router: router, screen: Self.screen)
                .environment(\.contentLoader, ContentLoader(bundle: .main))
                .environment(\.platform, PlatformServices(auth: KeychainAuthStore(), sharedData: SharedDataPublisher(), offlineAudio: OfflineAudioAdapter()))
        }
        .onChange(of: scenePhase) { phase in
            if phase == .active { NativeNotificationsLifecycle.didBecomeActive(notificationsEnabled: true) }
        }
    }

    /// شاشة مسجّلة في السجل، وإلا العنصر النائب لحين ظهور قالبها.
    @MainActor
    static func screen(_ route: Route) -> AnyView {
        if case .native(let id) = route, let view = TemplateRegistry.shared.view(for: id) { return view }
        return RootTabView.placeholder(route)
    }
}
