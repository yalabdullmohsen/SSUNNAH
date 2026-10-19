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
        if items.isEmpty { EmptyStateView().frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg) } else {
            if inline { inlineRows } else { tiles }
        }
    }
    /// مربعات SunnahTileGrid: الضغط يفتح `base/id`.
    private var tiles: some View {
        ScrollView {
            SunnahTileGrid(items.map { SunnahTileItem(id: $0.id, title: $0.title, subtitle: $0.subtitle) }, idPrefix: "list") { tile in
                if let item = items.first(where: { $0.id == tile.id }) { tap(item) }
            }
            .padding(.vertical, Sunnah.Spacing.s2)
        }
        .sunnahReadableWidth().background(Sunnah.Colors.bg)
    }
    /// النص يتمدّد في موضعه، فيبقى صفًّا لا مربعًا.
    private var inlineRows: some View {
        SunnahRowStack {
            ForEach(items) { item in
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    Button { tap(item) } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                        .sunnahPressable()
                        .accessibilityValue(item.body != nil ? (expanded.contains(item.id) ? "موسَّع" : "مطوي") : "")
                    if expanded.contains(item.id), let body = item.body {
                        SunnahMarkdownText(body, style: .body)
                            .frame(maxWidth: .infinity, alignment: .leading).transition(.opacity)
                    }
                }
                .sunnahStackRow()
            }
        }
        .sunnahReadableWidth()
    }
    private func tap(_ item: ContentItem) {
        guard inline, item.body != nil else { openRoute(item.path(base: detailBase)); return }
        sunnahAnimate {
            if expanded.contains(item.id) { expanded.remove(item.id) } else { expanded.insert(item.id) }
        }
    }
}
