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
            let groups = inline ? [] : Self.contiguousGroups(items)
            SunnahJumpIndex(keys: groups.map(\.key), count: items.count) {
                scroll(groups)
            }
        }
    }

    struct Group { let key: String; var items: [ContentItem] }

    /// مجموعات متجاورة بالحرف الفهرسي؛ تُرجع فارغة إذا تكرر حرف في موضعين (ترتيب غير أبجدي) فلا يُفعَّل الفهرس.
    static func contiguousGroups(_ items: [ContentItem]) -> [Group] {
        guard items.count > SunnahJumpIndex<EmptyView>.threshold else { return [] }
        var out: [Group] = []; var seen = Set<String>()
        for it in items {
            let k = SunnahJumpIndex<EmptyView>.key(for: it.title)
            if out.last?.key == k { out[out.count - 1].items.append(it) }
            else { if !seen.insert(k).inserted { return [] }; out.append(Group(key: k, items: [it])) }
        }
        return out
    }

    private func scroll(_ groups: [Group]) -> some View {
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
                    } else if groups.count > 1 {
                        ForEach(groups, id: \.key) { g in
                            SunnahTileGrid(g.items.map(tile), idPrefix: "list.item") { t in
                                if let item = items.first(where: { $0.id == t.id }) { openRoute(item.path(base: detailBase)) }
                            }.sunnahJumpAnchor(g.key)
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
    private func tile(_ item: ContentItem) -> SunnahTileItem { SunnahTileItem(id: item.id, title: item.title, subtitle: item.subtitle) }
}
