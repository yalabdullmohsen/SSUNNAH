import SwiftUI

/// قالب 1 — قائمة عناصر. `inline: true` يعرض النص في الشاشة نفسها (تمدّد) بدل فتح `base/id`.
public struct ListTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let items: [ContentItem]; let detailBase: String; let inline: Bool
    @State private var expanded: Set<String> = []
    public init(items: [ContentItem], detailBase: String, inline: Bool = false) {
        self.items = items; self.detailBase = detailBase; self.inline = inline
    }
    public var body: some View {
        if items.isEmpty { EmptyStateView() } else {
            List(items) { item in
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    Button { tap(item) } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                        .buttonStyle(.plain)
                        .accessibilityValue(inline && item.body != nil ? (expanded.contains(item.id) ? "موسَّع" : "مطوي") : "")
                    if inline, expanded.contains(item.id), let body = item.body {
                        Text(body).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading).transition(.opacity)
                    }
                }
                .listRowBackground(Sunnah.Colors.surface)
            }
            .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        }
    }
    private func tap(_ item: ContentItem) {
        guard inline, item.body != nil else { openRoute(item.path(base: detailBase)); return }
        sunnahAnimate {
            if expanded.contains(item.id) { expanded.remove(item.id) } else { expanded.insert(item.id) }
        }
    }
}
