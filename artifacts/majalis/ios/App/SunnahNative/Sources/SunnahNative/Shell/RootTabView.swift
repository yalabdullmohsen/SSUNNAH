import SwiftUI

/// يبني الشاشة لكل وجهة؛ يُحقن من التطبيق (WebScreen للشاشات غير المحوّلة).
public typealias ScreenBuilder = (Route) -> AnyView

/// الجذر الأصلي: TabView بخمسة تبويبات، لكل منها NavigationStack مستقل، بالعربية من اليمين.
public struct RootTabView: View {
    @ObservedObject private var router: AppRouter
    private let screen: ScreenBuilder
    @State private var showDrawer = false

    public init(router: AppRouter, screen: @escaping ScreenBuilder = RootTabView.placeholder) {
        self.router = router
        self.screen = screen
    }

    public var body: some View {
        NavigationStack(path: $router.stack) {
            screen(AppTab.home.rootRoute)
                .navigationTitle("الرئيسية")
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
                .navigationDestination(for: Route.self) { screen($0) }
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            // المصحف غامر (كالمرجع): لا شريط تبويب فوق الصفحة؛ الخروج من أداة «إغلاق» في القارئ.
            if !(router.stack.last?.path ?? "/").hasPrefix("/mushaf") {
                SunnahTabBar(selected: AppTab.owning(path: router.stack.last?.path ?? "/")) { router.stack = []; router.open(path: $0.rootPath) }
            }
        }
        .environment(\.openRoute) { [router] in Sunnah.Haptics.select(); router.open(path: $0) }
        .overlay {
            if showDrawer {
                ZStack(alignment: .leading) {
                    Color.black.opacity(0.35).ignoresSafeArea().onTapGesture { sunnahAnimate { showDrawer = false } }
                    SunnahDrawer(open: { router.stack = []; router.open(path: $0) }, close: { sunnahAnimate { showDrawer = false } })
                        .ignoresSafeArea(edges: .vertical).transition(.move(edge: .leading))
                }
            }
        }
        .tint(Sunnah.Colors.primary)
        .toggleStyle(SunnahToggleStyle())
        .environment(\.layoutDirection, .rightToLeft)
        .environment(\.locale, Locale(identifier: "ar-u-nu-latn"))
        .onOpenURL { router.open(url: $0) }
    }

    public static func placeholder(_ route: Route) -> AnyView {
        AnyView(EmptyStateView(title: "تعذّر فتح هذه الشاشة").screenState(.error).navigationTitle(AppTab.owning(path: route.path).title))
    }
}
