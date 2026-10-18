import SwiftUI

/// يبني الشاشة لكل وجهة؛ يُحقن من التطبيق (WebScreen للشاشات غير المحوّلة).
public typealias ScreenBuilder = (Route) -> AnyView

/// الجذر الأصلي: TabView بخمسة تبويبات، لكل منها NavigationStack مستقل، بالعربية من اليمين.
public struct RootTabView: View {
    @ObservedObject private var router: AppRouter
    private let screen: ScreenBuilder
    #if DEBUG
    @State private var showDrawer = ProcessInfo.processInfo.environment["SNAP_DRAWER"] == "1"   // لقطات التدقيق فقط
    #else
    @State private var showDrawer = false
    #endif
    @StateObject private var immersive = ImmersiveReaderState()

    public init(router: AppRouter, screen: @escaping ScreenBuilder = RootTabView.placeholder) {
        self.router = router
        self.screen = screen
    }

    private var tabBarShown: Bool { !immersive.hidesTabBar && !ReaderRoutes.hidesTabBar(path: router.stack.last?.path ?? "/") }

    public var body: some View {
        NavigationStack(path: $router.stack) {
            screen(AppTab.home.rootRoute)
                .sunnahNavTitle("الرئيسية")
                #if os(iOS)
                .navigationBarTitleDisplayMode(.large)
                #endif
                .toolbar {
                    #if os(iOS)
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button { Sunnah.Haptics.select(); sunnahAnimate { showDrawer = true } } label: { Image(systemName: "line.3.horizontal") }
                            .accessibilityLabel("القائمة")
                    }
                    #endif
                    ToolbarItem(placement: .primaryAction) {
                        Button { router.open(path: "/search") } label: { Image(systemName: "magnifyingglass") }
                            .accessibilityLabel("البحث")
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Menu {
                            Button { router.open(path: "/my-submissions") } label: { Label("مساهماتي", systemImage: "tray.full") }
                            Button { router.open(path: "/login") } label: { Label("تسجيل الدخول", systemImage: "person.crop.circle.badge.plus") }
                            Button { router.open(path: "/settings") } label: { Label("الإعدادات", systemImage: "gearshape") }
                        } label: { Image(systemName: "person.crop.circle") }
                            .accessibilityLabel("الحساب")
                    }
                }
                .navigationDestination(for: Route.self) { screen($0).sunnahDestination($0) }
        }
        // الشريط عائم فوق المحتوى (الـNavigationStack لا يمرّر الـinset إلى ScrollView الداخلية)، فيُضاف هامش سفلي مرة واحدة لكل المحتوى القابل للتمرير حتى لا يختبئ آخر عنصر خلفه.
        .modifier(TabBarScrollMargin(height: tabBarShown ? SunnahTabBar.reservedHeight : 0))
        .safeAreaInset(edge: .bottom, spacing: 0) {
            // شاشات القراءة الكاملة (المصحف…) تعلن `.immersiveReader()` فيختفي الشريط عنها أيًّا كان مسار فتحها؛ لمسة الصفحة تُظهره.
            if tabBarShown {
                SunnahTabBar(selected: AppTab.owning(path: router.stack.last?.path ?? "/")) { router.stack = []; router.open(path: $0.rootPath) }
            }
        }
        .environment(\.immersiveReader, immersive)
        .environment(\.openRoute) { [router] in Sunnah.Haptics.select(); router.open(path: $0) }
        .overlay {
            if showDrawer {
                ZStack(alignment: .leading) {
                    Color.black.opacity(0.4).ignoresSafeArea().onTapGesture { sunnahAnimate { showDrawer = false } }
                        .accessibilityLabel("إغلاق القائمة").accessibilityAddTraits(.isButton)
                    SunnahDrawer(selectedPath: router.stack.last?.path ?? "/", open: { router.stack = []; router.open(path: $0) }, close: { sunnahAnimate { showDrawer = false } })
                        .transition(.move(edge: .leading))
                }
            }
        }
        .sunnahNavigationMotion(depth: router.stack.count)
        .tint(Sunnah.Colors.primary)
        .toggleStyle(SunnahToggleStyle())
        .environment(\.layoutDirection, .rightToLeft)
        .environment(\.locale, Sunnah.locale)
        .onOpenURL { router.open(url: $0) }
        #if DEBUG
        .task {   // لقطات التدقيق فقط: `-snapshotRoute <route>` (أي مسار مسجّل، مثل /fawaid أو /hadith/daif) يُفتح عند الإقلاع بلا حوار الرابط العميق
            if let p = UserDefaults.standard.string(forKey: "snapshotRoute"), p.hasPrefix("/") { router.open(path: p) }
            SnapshotScroll.startIfRequested()   // `-snapshotScroll end`: يمرّر الشاشة المفتوحة إلى نهايتها (انظر docs/native/SNAPSHOT_ARGS.md)
        }
        #endif
    }

    public static func placeholder(_ route: Route) -> AnyView {
        AnyView(EmptyStateView(title: "تعذّر فتح هذه الشاشة").screenState(.error).sunnahNavTitle(AppTab.owning(path: route.path).title))
    }
}

private struct TabBarScrollMargin: ViewModifier {
    let height: CGFloat
    func body(content: Content) -> some View {
        if #available(iOS 17.0, macOS 14.0, *) { content.contentMargins(.bottom, height, for: .scrollContent) } else { content }
    }
}
