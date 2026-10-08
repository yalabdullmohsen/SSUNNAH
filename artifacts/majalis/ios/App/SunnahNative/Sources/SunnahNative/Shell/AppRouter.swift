import SwiftUI

/// حالة التنقل: التبويب المختار ومكدّس كل تبويب مستقل.
@MainActor
public final class AppRouter: ObservableObject {
    @Published public var selectedTab: AppTab
    @Published public var stacks: [AppTab: [Route]]

    public init(selectedTab: AppTab = .home) {
        self.selectedTab = selectedTab
        self.stacks = Dictionary(uniqueKeysWithValues: AppTab.allCases.map { ($0, []) })
    }

    public func binding(for tab: AppTab) -> Binding<[Route]> {
        Binding(
            get: { self.stacks[tab] ?? [] },
            set: { self.stacks[tab] = $0 }
        )
    }

    /// إعادة اختيار التبويب الحالي ترجع إلى جذره (سلوك iOS المعتاد).
    public func select(_ tab: AppTab) {
        if tab == selectedTab {
            stacks[tab] = []
        } else {
            selectedTab = tab
        }
    }

    /// يفتح مسارًا في التبويب المالك له؛ جذر التبويب يصفّر مكدّسه.
    public func open(path raw: String) {
        let path = Route.normalize(raw)
        let tab = AppTab.owning(path: path)
        selectedTab = tab
        if path == tab.rootPath {
            stacks[tab] = []
        } else if stacks[tab]?.last != .web(path: path) {
            stacks[tab, default: []].append(.web(path: path))
        }
    }

    /// رابط عميق أو رابط من النطاق؛ يعيد false لما هو خارج التطبيق.
    @discardableResult
    public func open(url: URL) -> Bool {
        guard let path = Route.path(from: url) else { return false }
        open(path: path)
        return true
    }
}
