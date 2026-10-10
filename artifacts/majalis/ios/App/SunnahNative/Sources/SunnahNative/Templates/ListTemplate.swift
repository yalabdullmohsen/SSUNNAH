import SwiftUI

/// قالب 1 — قائمة عناصر.
public struct ListTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let items: [ContentItem]; let detailBase: String
    public init(items: [ContentItem], detailBase: String) { self.items = items; self.detailBase = detailBase }
    public var body: some View {
        if items.isEmpty { EmptyStateView() } else {
            List(items) { item in
                Button { openRoute(item.path(base: detailBase)) } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                    .buttonStyle(.plain).listRowBackground(Sunnah.Colors.surface)
            }
            .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        }
    }
}
