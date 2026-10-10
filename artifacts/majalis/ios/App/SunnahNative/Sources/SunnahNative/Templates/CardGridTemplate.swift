import SwiftUI

/// قالب 4 — شبكة بطاقات تتكيّف مع العرض وحجم الخط.
public struct CardGridTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let items: [ContentItem]; let detailBase: String
    public init(items: [ContentItem], detailBase: String) { self.items = items; self.detailBase = detailBase }
    public var body: some View {
        if items.isEmpty { EmptyStateView() } else {
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: Sunnah.Spacing.cardMinWidth), spacing: Sunnah.Spacing.s3)], spacing: Sunnah.Spacing.s3) {
                    ForEach(items) { item in
                        Button { openRoute(item.path(base: detailBase)) } label: { ContentCard(item) }.buttonStyle(.plain)
                    }
                }
                .padding(Sunnah.Spacing.pageX)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}
