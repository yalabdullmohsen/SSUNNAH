import SwiftUI

/// قالب 1 — قائمة عناصر. `inline: true` يعرض النص في الشاشة نفسها (تمدّد) بدل فتح `base/id`.
public struct ListTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let items: [ContentItem]; let detailBase: String; let inline: Bool
    public init(items: [ContentItem], detailBase: String, inline: Bool = false) {
        self.items = items; self.detailBase = detailBase; self.inline = inline
    }
    public var body: some View {
        if items.isEmpty { EmptyStateView().frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg) } else {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    if inline {
                        ForEach(items) { item in
                            if let body = item.body {
                                SunnahExpandableCard(item.title, subtitle: item.subtitle) {
                                    SunnahMarkdownText(body, style: .body).frame(maxWidth: .infinity, alignment: .leading)
                                }
                            } else {
                                SunnahTileGrid([tile(item)], idPrefix: "list.item") { _ in openRoute(item.path(base: detailBase)) }
                            }
                        }
                    } else {
                        SunnahTileGrid(items.map(tile), idPrefix: "list.item") { t in
                            if let item = items.first(where: { $0.id == t.id }) { openRoute(item.path(base: detailBase)) }
                        }
                    }
                }
                .padding(.top, Sunnah.Spacing.s2).padding(.bottom, 96)
            }
            .sunnahReadableWidth().background(Sunnah.Colors.bg)
        }
    }
    private func tile(_ item: ContentItem) -> SunnahTileItem { SunnahTileItem(id: item.id, title: item.title, subtitle: item.subtitle) }
}
