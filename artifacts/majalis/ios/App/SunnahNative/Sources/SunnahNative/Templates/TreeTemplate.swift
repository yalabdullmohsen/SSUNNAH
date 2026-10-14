import SwiftUI

public struct TreeNode: Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public var subtitle: String?
    public var route: String?
    public var children: [TreeNode]?
    public init(id: String, title: String, subtitle: String? = nil, route: String? = nil, children: [TreeNode]? = nil) {
        self.id = id; self.title = title; self.subtitle = subtitle; self.route = route; self.children = children
    }
    /// العمق الأقصى للشجرة (جذر بلا أبناء = 1).
    public var depth: Int { 1 + (children?.map(\.depth).max() ?? 0) }
}

/// قالب 10 — شجرة: عقد تتمدد (نسب الأنبياء، خرائط ذهنية). العقدة ذات `route` تفتح مسارها عند الضغط.
public struct TreeTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let roots: [TreeNode]
    public init(roots: [TreeNode]) { self.roots = roots }
    public var body: some View {
        if roots.isEmpty { EmptyStateView() } else {
            List(roots, children: \.children) { node in
                Button { if let r = node.route { openRoute(r) } } label: {
                    SunnahListRow(title: node.title, subtitle: node.subtitle)
                }
                .buttonStyle(.plain).sunnahRowChrome()
            }
            .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        }
    }
}
