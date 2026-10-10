import SwiftUI

/// قالب 1 — قائمة عناصر لقسم.
public struct ListTemplate: View {
    let section: String; let title: String; let open: (ContentItem) -> Void
    public init(section: String, title: String, open: @escaping (ContentItem) -> Void = { _ in }) {
        self.section = section; self.title = title; self.open = open
    }
    public var body: some View {
        Loaded(load: { try await $0.items(section: section) }, isEmpty: { $0.isEmpty }) { items in
            List(items) { item in
                Button { open(item) } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                    .buttonStyle(.plain)
                    .listRowBackground(Sunnah.Colors.surface)
            }
            .listStyle(.plain).scrollContentBackground(.hidden)
        }
        .background(Sunnah.Colors.bg).navigationTitle(title)
    }
}
