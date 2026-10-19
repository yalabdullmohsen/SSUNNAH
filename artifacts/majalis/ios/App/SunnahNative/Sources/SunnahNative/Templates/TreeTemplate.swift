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
            SunnahRowStack {
                ForEach(roots) { node in TreeRow(node: node, level: 0) }
            }
        }
    }
}

/// صف عقدة يتمدد بأبنائه (بديل `List(children:)`): الإزاحة بحسب العمق، والسهم يفتح/يطوي، والصف يفتح المسار إن وُجد.
private struct TreeRow: View {
    @Environment(\.openRoute) private var openRoute
    let node: TreeNode; let level: Int
    @State private var open = false
    private var kids: [TreeNode] { node.children ?? [] }
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: Sunnah.Spacing.s2) {
                Button { if let r = node.route { openRoute(r) } else if !kids.isEmpty { toggle() } } label: {
                    SunnahListRow(title: node.title, subtitle: node.subtitle)
                }
                .sunnahPressable()
                if !kids.isEmpty {
                    Button { toggle() } label: {
                        Image(systemName: open ? "chevron.up" : "chevron.down").foregroundStyle(Sunnah.Colors.textSecondary)
                            .frame(minWidth: Sunnah.Spacing.touch, minHeight: Sunnah.Spacing.touch)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(open ? "طيّ \(node.title)" : "توسيع \(node.title)")
                }
            }
            .sunnahStackRow()
            if open { ForEach(kids) { TreeRow(node: $0, level: level + 1) } }
        }
        .padding(.leading, CGFloat(min(level, 4)) * Sunnah.Spacing.s4)
    }
    private func toggle() { sunnahAnimate { open.toggle() } }
}
