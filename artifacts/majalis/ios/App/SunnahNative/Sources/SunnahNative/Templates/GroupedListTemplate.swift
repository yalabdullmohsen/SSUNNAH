import SwiftUI

/// مجموعة عناوين وعناصر لقالب القائمة المجمّعة.
public struct ContentGroup: Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public var items: [ContentItem]
    public init(id: String, title: String, items: [ContentItem]) { self.id = id; self.title = title; self.items = items }
}

/// قالب 9 — قائمة مجمّعة: أقسام بعناوين، عنصر يتمدد في موضعه (أو يفتح مساره إن وُجد `route`)، وبحث عربي مطبَّع.
public struct GroupedListTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let groups: [ContentGroup]
    @State private var query = ""

    public init(groups: [ContentGroup]) { self.groups = groups }

    private var visible: [ContentGroup] {
        let q = ArabicText.normalize(query)
        guard !q.isEmpty else { return groups }
        return groups.compactMap { g in
            let hits = g.items.filter { ArabicText.normalize($0.title + " " + ($0.subtitle ?? "") + " " + ($0.body ?? "")).contains(q) }
            return hits.isEmpty ? nil : ContentGroup(id: g.id, title: g.title, items: hits)
        }
    }

    public var body: some View {
        VStack(spacing: 0) {
            SunnahSearchField(text: $query, prompt: "ابحث", idPrefix: "grouped.search").padding(.vertical, Sunnah.Spacing.s2)
            if groups.isEmpty { EmptyStateView().frame(maxHeight: .infinity) }
            else if visible.isEmpty { EmptyStateView(title: "لا نتائج").frame(maxHeight: .infinity) }
            else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        ForEach(visible) { group in
                            Text(group.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                                .padding(.horizontal, Sunnah.Spacing.pageX + 4).accessibilityAddTraits(.isHeader)
                            ForEach(group.items) { item in row(item) }
                        }
                    }
                    .padding(.bottom, 96).id(query.isEmpty)
                }
                .sunnahReadableWidth()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
    }

    @ViewBuilder private func row(_ item: ContentItem) -> some View {
        if item.route == nil, let body = item.body {
            SunnahExpandableCard(item.title, subtitle: item.subtitle, startsExpanded: !query.isEmpty) {
                Text(body.arabicDigits).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        } else {
            SunnahTileGrid([SunnahTileItem(id: item.id, title: item.title, subtitle: item.subtitle)], idPrefix: "grouped.item") { _ in
                if let r = item.route { openRoute(r) }
            }
        }
    }
}
