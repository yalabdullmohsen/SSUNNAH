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
    @State private var expanded: Set<String> = []

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
        Group {
            if groups.isEmpty { EmptyStateView() }
            else if visible.isEmpty { EmptyStateView(title: "لا نتائج") }
            else {
                List {
                    ForEach(visible) { group in
                        Section {
                            ForEach(group.items) { item in row(item) }
                        } header: {
                            Text(group.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                .textCase(nil).accessibilityAddTraits(.isHeader)
                        }
                    }
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .searchable(text: $query)
    }

    @ViewBuilder private func row(_ item: ContentItem) -> some View {
        let open = expanded.contains(item.id) || !query.isEmpty
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            Button {
                if let r = item.route { openRoute(r) }
                else if item.body != nil { sunnahAnimate { toggle(item.id) } }
            } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                .buttonStyle(.plain)
                .accessibilityValue(item.body == nil || item.route != nil ? "" : (open ? "موسَّع" : "مطوي"))
            if open, item.route == nil, let body = item.body {
                Text(body).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading).transition(.opacity)
            }
        }
        .sunnahRowChrome()
    }

    private func toggle(_ id: String) {
        if expanded.contains(id) { expanded.remove(id) } else { expanded.insert(id) }
    }
}
