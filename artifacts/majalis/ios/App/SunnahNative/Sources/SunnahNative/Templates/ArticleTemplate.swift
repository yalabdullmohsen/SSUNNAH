import SwiftUI

/// قالب 3 — نص طويل/مقال مع عناصر القراءة: حجم الخط (Dynamic Type) ووضع الليل. الاختيار يُحفظ.
public struct ArticleTemplate: View {
    let item: ContentItem
    @AppStorage("reader.sizeStep") private var sizeStep = 0
    @AppStorage("reader.night") private var night = false
    @Environment(\.dynamicTypeSize) private var systemSize
    public init(item: ContentItem) { self.item = item }

    private var size: DynamicTypeSize {
        let all = DynamicTypeSize.allCases
        let i = all.firstIndex(of: systemSize) ?? 0
        return all[max(0, min(all.count - 1, i + sizeStep))]
    }

    public var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                DetailHero(title: item.title, subtitle: item.subtitle, tags: item.tags)
                ForEach(Array((item.body ?? "").components(separatedBy: "\n\n").enumerated()), id: \.offset) { _, p in
                    SunnahMarkdownText(p, style: .body)
                        .padding(.horizontal, Sunnah.Spacing.pageX)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading).padding(.bottom, Sunnah.Spacing.pageX)
        }
        .dynamicTypeSize(size)
        .background(Sunnah.Colors.bg).bodyTitledNavigation()
        .preferredColorScheme(night ? .dark : nil)
        .toolbar {
            ToolbarItemGroup(placement: .primaryAction) {
                Button { sizeStep = max(-2, sizeStep - 1) } label: { Image(systemName: "textformat.size.smaller") }
                    .accessibilityLabel("تصغير الخط")
                Button { sizeStep = min(4, sizeStep + 1) } label: { Image(systemName: "textformat.size.larger") }
                    .accessibilityLabel("تكبير الخط")
                Button { night.toggle() } label: { Image(systemName: night ? "sun.max" : "moon") }
                    .accessibilityLabel(night ? "الوضع النهاري" : "وضع الليل")
            }
        }
    }
}
