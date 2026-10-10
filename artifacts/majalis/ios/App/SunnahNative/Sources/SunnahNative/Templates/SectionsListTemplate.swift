import SwiftUI

/// قالب 8 — قائمة أقسام: مداخل لشاشات فرعية.
public struct SectionsListTemplate: View {
    let section: String; let title: String; let open: (SectionLink) -> Void
    public init(section: String, title: String, open: @escaping (SectionLink) -> Void = { _ in }) {
        self.section = section; self.title = title; self.open = open
    }
    public var body: some View {
        Loaded(load: { try await $0.links(section: section) }, isEmpty: { $0.isEmpty }) { links in
            ScrollView {
                LazyVStack(spacing: Sunnah.Spacing.s3) {
                    ForEach(links) { link in
                        Button { open(link) } label: { SunnahCard { SunnahListRow(title: link.title, subtitle: link.subtitle) } }
                            .buttonStyle(.plain)
                    }
                }
                .padding(Sunnah.Spacing.pageX)
            }
        }
        .background(Sunnah.Colors.bg).navigationTitle(title)
    }
}
