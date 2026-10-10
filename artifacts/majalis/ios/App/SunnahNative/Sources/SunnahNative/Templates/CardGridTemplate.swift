import SwiftUI

/// قالب 4 — شبكة بطاقات تتكيّف مع العرض وحجم الخط.
public struct CardGridTemplate: View {
    let section: String; let title: String; let open: (ContentItem) -> Void
    public init(section: String, title: String, open: @escaping (ContentItem) -> Void = { _ in }) {
        self.section = section; self.title = title; self.open = open
    }
    public var body: some View {
        Loaded(load: { try await $0.items(section: section) }, isEmpty: { $0.isEmpty }) { items in
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: Sunnah.Spacing.cardMinWidth), spacing: Sunnah.Spacing.s3)], spacing: Sunnah.Spacing.s3) {
                    ForEach(items) { item in
                        Button { open(item) } label: { ContentCard(item) }.buttonStyle(.plain)
                    }
                }
                .padding(Sunnah.Spacing.pageX)
            }
        }
        .background(Sunnah.Colors.bg).navigationTitle(title)
    }
}
