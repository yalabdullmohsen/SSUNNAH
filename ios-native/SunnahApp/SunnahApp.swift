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
        RouteResolver.registerAll(in: .shared)
        // نظام إشعارات واحد (الصلاة + الأذكار + الورد...) بموافقة المستخدم فقط؛ لا بوابة ويب في التطبيق الأصلي.
        NativeNotificationsLifecycle.didFinishLaunching(notificationsEnabled: true)
    }

    var body: some Scene {
        WindowGroup {
            RootTabView(router: router, screen: Self.screen)
                .onAppear {
                    PrayerWidgetPublisher.publish()
                    // لقطات native-loop: -snapshotRoute /path (للتصحيح فقط)
                    #if DEBUG
                    if let p = UserDefaults.standard.string(forKey: "snapshotRoute") { router.open(path: p) }
                    #endif
                }
                .environment(\.contentLoader, ContentLoader.live(bundle: .main))
                .environment(\.platform, PlatformServices(auth: KeychainAuthStore(), sharedData: SharedDataPublisher(), offlineAudio: OfflineAudioAdapter(), liveActivity: LiveActivityAdapter(), authService: SupabaseAuthAdapter(store: KeychainAuthStore())))
        }
        .onChange(of: scenePhase) { phase in
            if phase == .active { PrayerWidgetPublisher.publish(); NativeNotificationsLifecycle.didBecomeActive(notificationsEnabled: true) }
        }
    }

    /// شاشة مسجّلة في السجل، وإلا العنصر النائب لحين ظهور قالبها.
    @MainActor
    static func screen(_ route: Route) -> AnyView {
        if case .native(let id) = route, let view = TemplateRegistry.shared.view(for: id) { return view }
        if case .web(let path) = route, let view = resolve(path: path) { return view }
        return RootTabView.placeholder(route)
    }

    /// مسار → شاشة: انظر `RouteResolver` (الحزمة؛ مختبَر بوحدات).
    @MainActor
    static func resolve(path raw: String) -> AnyView? { RouteResolver.resolve(path: raw) }
}
