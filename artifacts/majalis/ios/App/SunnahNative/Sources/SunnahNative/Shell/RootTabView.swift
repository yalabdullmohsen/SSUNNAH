import SwiftUI

/// يبني الشاشة لكل وجهة؛ يُحقن من التطبيق (WebScreen للشاشات غير المحوّلة).
public typealias ScreenBuilder = (Route) -> AnyView

/// الجذر الأصلي: TabView بخمسة تبويبات، لكل منها NavigationStack مستقل، بالعربية من اليمين.
public struct RootTabView: View {
    @ObservedObject private var router: AppRouter
    private let screen: ScreenBuilder

    public init(router: AppRouter, screen: @escaping ScreenBuilder = RootTabView.placeholder) {
        self.router = router
        self.screen = screen
    }

    public var body: some View {
        TabView(selection: tabSelection) {
            ForEach(AppTab.allCases) { tab in
                NavigationStack(path: router.binding(for: tab)) {
                    screen(tab.rootRoute)
                        .navigationDestination(for: Route.self) { screen($0) }
                }
                .tabItem { Label(tab.title, systemImage: tab.systemImage) }
                .tag(tab)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .environment(\.locale, Locale(identifier: "ar"))
        .onOpenURL { router.open(url: $0) }
    }

    /// يمرّ عبر `select` كي تعيد إعادةُ النقر على التبويب الحالي مكدّسَه إلى الجذر.
    private var tabSelection: Binding<AppTab> {
        Binding(get: { router.selectedTab }, set: { router.select($0) })
    }

    public static func placeholder(_ route: Route) -> AnyView {
        AnyView(Text(route.path).navigationTitle(AppTab.owning(path: route.path).title))
    }
}
