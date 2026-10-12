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
        // التسجيل: مولَّد القوالب أولًا ثم الأقسام (تستبدل المعرّفات نفسها) ثم الشاشات الخاصة.
        GeneratedScreens.registerAll(in: .shared)
        SirahSection.register(in: .shared)
        AqidahSection.register(in: .shared)
        FiqhSection.register(in: .shared)
        LibrarySection.register(in: .shared)
        LearnSection.register(in: .shared)
        AccountSection.register(in: .shared)
        QuranSection.register(in: .shared)
        SpecialScreens.registerAll(in: .shared)
        // نظام إشعارات واحد (الصلاة + الأذكار + الورد...) بموافقة المستخدم فقط؛ لا بوابة ويب في التطبيق الأصلي.
        NativeNotificationsLifecycle.didFinishLaunching(notificationsEnabled: true)
    }

    var body: some Scene {
        WindowGroup {
            RootTabView(router: router, screen: Self.screen)
                .onAppear {
                    // لقطات native-loop: -snapshotRoute /path (للتصحيح فقط)
                    #if DEBUG
                    if let p = UserDefaults.standard.string(forKey: "snapshotRoute") { router.open(path: p) }
                    #endif
                }
                .environment(\.contentLoader, ContentLoader.live(bundle: .main))
                .environment(\.platform, PlatformServices(auth: KeychainAuthStore(), sharedData: SharedDataPublisher(), offlineAudio: OfflineAudioAdapter(), liveActivity: LiveActivityAdapter(), authService: SupabaseAuthAdapter(store: KeychainAuthStore())))
        }
        .onChange(of: scenePhase) { phase in
            if phase == .active { NativeNotificationsLifecycle.didBecomeActive(notificationsEnabled: true) }
        }
    }

    /// شاشة مسجّلة في السجل، وإلا العنصر النائب لحين ظهور قالبها.
    @MainActor
    static func screen(_ route: Route) -> AnyView {
        if case .native(let id) = route, let view = TemplateRegistry.shared.view(for: id) { return view }
        if case .web(let path) = route, let view = resolve(path: path) { return view }
        return RootTabView.placeholder(route)
    }

    /// مسار → شاشة: الأقسام قبل المولَّد (انظر تعليقات *Section.resolve).
    @MainActor
    static func resolve(path raw: String) -> AnyView? {
        let path = Route.normalize(raw)
        let base = path.split(whereSeparator: { $0 == "?" || $0 == "#" }).first.map(String.init) ?? path
        let comps = base.split(separator: "/").map(String.init)
        if let v = SirahSection.resolve(path: base) { return v }
        if let v = AqidahSection.resolve(path: base) { return v }
        if let v = FiqhSection.resolve(path: base) { return v }
        if let v = LibrarySection.resolve(path: base) { return v }
        if let v = LearnSection.resolve(path: base) { return v }
        if let v = AccountSection.resolve(comps) { return v }
        if let v = HadithScreens.resolve(path: base) { return v }
        if let v = GeneratedScreens.resolve(path: base) { return v }
        // صفحات القوائم مسجَّلة كقوالب بمعرّف = المسار (أو مقاطعه مضمومة بشرطة).
        for id in [comps.joined(separator: "/"), comps.joined(separator: "-"), comps.joined(separator: "."), comps.last ?? ""] where !id.isEmpty {
            if let v = TemplateRegistry.shared.view(for: id) { return v }
        }
        return nil
    }
}
