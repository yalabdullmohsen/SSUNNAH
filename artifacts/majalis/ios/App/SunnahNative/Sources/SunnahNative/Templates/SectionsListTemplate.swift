import SwiftUI

/// قالب 8 — قائمة أقسام: مداخل لشاشات فرعية.
public struct SectionsListTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let links: [SectionLink]
    public init(links: [SectionLink]) { self.links = links }
    public var body: some View {
        if links.isEmpty { EmptyStateView() } else {
            ScrollView {
                LazyVStack(spacing: Sunnah.Spacing.s3) {
                    ForEach(links) { link in
                        Button { openRoute(link.route) } label: { SunnahCard { SunnahListRow(title: link.title, subtitle: link.subtitle) } }
                            .sunnahPressable()
                    }
                }
                .padding(Sunnah.Spacing.pageX)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}
