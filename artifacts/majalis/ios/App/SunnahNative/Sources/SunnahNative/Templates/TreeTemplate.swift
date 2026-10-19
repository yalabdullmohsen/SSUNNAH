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
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    ForEach(roots) { node in nodeView(node) }
                }
                .padding(.top, Sunnah.Spacing.s2).padding(.bottom, 96)
            }
            .sunnahReadableWidth().background(Sunnah.Colors.bg)
        }
    }

    private func nodeView(_ node: TreeNode) -> AnyView {
        if let kids = node.children, !kids.isEmpty {
            return AnyView(SunnahExpandableCard(node.title, subtitle: node.subtitle) {
                VStack(alignment: .leading, spacing: 10) {
                    if let r = node.route {
                        Button { openRoute(r) } label: { SunnahListRow(title: node.title, subtitle: node.subtitle) }.sunnahPressable()
                    }
                    ForEach(kids) { nodeView($0) }
                }
            })
        }
        return AnyView(SunnahTileGrid([SunnahTileItem(id: node.id, title: node.title, subtitle: node.subtitle)], idPrefix: "tree.node") { _ in
            if let r = node.route { openRoute(r) }
        })
    }
}
