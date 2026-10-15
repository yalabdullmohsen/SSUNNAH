import SwiftUI
import SunnahNative
import SunnahPrayer

/// نقطة دخول التطبيق الأصلي الصرف (بلا WebView ولا Capacitor).
/// Bundle ID: com.yousef.majlisilm — نفس سجل App Store. مشروع Xcode يملكه ن4.
@main
struct SunnahApp: App {
    @StateObject private var router = AppRouter()
    @Environment(\.scenePhase) private var scenePhase
    #if DEBUG
    @StateObject private var readiness = SnapshotReadiness()
    #endif

    init() {
        PerformanceMetrics.shared.mark("initStart")
        RouteResolver.registerAll(in: .shared)
        PerformanceMetrics.shared.mark("routesDone")
        PerformanceMetrics.shared.start()
        PerformanceMetrics.shared.mark("metricsDone")
        // نظام إشعارات واحد (الصلاة + الأذكار + الورد...) بموافقة المستخدم فقط؛ لا بوابة ويب في التطبيق الأصلي.
        NativeNotificationsLifecycle.didFinishLaunching(notificationsEnabled: true)
        PerformanceMetrics.shared.mark("initDone")
    }

    var body: some Scene {
        let _ = PerformanceMetrics.shared.mark("bodyEval")
        WindowGroup {
            IntroHost(onMilestone: { PerformanceMetrics.shared.mark($0) }) {
            RootTabView(router: router, screen: Self.screen)
                .sunnahAppearance()
                .onAppear {
                    PerformanceMetrics.shared.mark("firstAppear")
                    PrayerWidgetPublisher.publish()
                    PerformanceMetrics.shared.mark("appearDone")
                    // لقطات native-loop: -snapshotRoute /path (للتصحيح فقط)
                    #if DEBUG
                    if let p = UserDefaults.standard.string(forKey: "snapshotRoute") { router.open(path: p); readiness.begin(route: p) }
                    if let f = UserDefaults.standard.string(forKey: "snapshotRoutes") { SnapshotRoutesRunner.run(file: f, router: router, readiness: readiness) }
                    #elseif MUSHAF_PROBE
                    // قياس Release للمصحف (ن3): بناء بـSWIFT_ACTIVE_COMPILATION_CONDITIONS=MUSHAF_PROBE فقط؛ لا يدخل أي بناء متجر.
                    if let p = UserDefaults.standard.string(forKey: "snapshotRoute") { router.open(path: p) }
                    #endif
                }
                #if DEBUG
                // حلقة التدقيق السريعة: جلسة واحدة؛ كل رابط عميق (simctl openurl) يُقلِّص المكدّس لوجهته ويبدأ انتظار الجاهزية.
                .onChange(of: router.stack) { stack in
                    guard UserDefaults.standard.bool(forKey: "auditLoop") else { return }
                    if stack.count > 1, let last = stack.last { router.stack = [last]; return }
                    if let last = stack.last { readiness.begin(route: last.path) }
                }
                // screen.ready: يعلن اكتمال التحميل (لا حالة خطأ/تحميل عالقة)؛ يقرؤه XCUITest، والسكربتات تقرأ snapshot-ready.json
                .overlay(alignment: .topLeading) {
                    if readiness.isReady { Color.clear.frame(width: 1, height: 1).accessibilityIdentifier(ScreenState.ready) }
                }
                #endif
                .environment(\.audioEngineFactory, AudioEngines.live)
                .environment(\.contentLoader, ContentLoader.live(bundle: .main))
                .environment(\.platform, Self.platform)
            }
        }
        .onChange(of: scenePhase) { phase in
            if phase == .active { PrayerWidgetPublisher.publish(); NativeNotificationsLifecycle.didBecomeActive(notificationsEnabled: true) }
        }
    }

    /// خدمات المنصة تُنشأ مرة واحدة (كانت تُبنى من جديد عند كل تقييم لـbody).
    private static let platform: PlatformServices = {
        defer { PerformanceMetrics.shared.mark("platformBuilt") }
        return PlatformServices(auth: KeychainAuthStore(), sharedData: SharedDataPublisher(), offlineAudio: OfflineAudioAdapter(), liveActivity: LiveActivityAdapter(), authService: SupabaseAuthAdapter(store: KeychainAuthStore()))
    }()

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
