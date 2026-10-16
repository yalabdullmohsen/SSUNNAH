import SwiftUI

/// قالب 3 — نص طويل/مقال مع عناصر القراءة: حجم الخط (Dynamic Type) ووضع الليل. الاختيار يُحفظ.
public struct ArticleTemplate: View {
    let item: ContentItem
    @AppStorage("reader.sizeStep") private var sizeStep = 0
    @AppStorage("reader.night") private var night = false
    @Environment(\.dynamicTypeSize) private var systemSize
    private let sections: [SunnahMarkdownSection]
    public init(item: ContentItem) { self.item = item; self.sections = SunnahMarkdown.sections(item.body ?? "") }

    private var size: DynamicTypeSize {
        let all = DynamicTypeSize.allCases
        let i = all.firstIndex(of: systemSize) ?? 0
        return all[max(0, min(all.count - 1, i + sizeStep))]
    }

    public var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                DetailHero(title: item.title, subtitle: item.subtitle, tags: item.tags)
                ForEach(sections) { sec in
                    SunnahSectionView(section: sec, key: item.id, style: .body)
                        .padding(.horizontal, Sunnah.Spacing.pageX)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading).padding(.bottom, Sunnah.Spacing.pageX)
        }
        .dynamicTypeSize(size)
        .sunnahReadableWidth().background(Sunnah.Colors.bg).bodyTitledNavigation()
        .preferredColorScheme(night ? .dark : nil)
        .toolbar {
            ToolbarItemGroup(placement: .primaryAction) {
                SunnahToolbarButton(systemImage: "textformat.size.smaller", label: "تصغير الخط") { sizeStep = max(-2, sizeStep - 1) }
                SunnahToolbarButton(systemImage: "textformat.size.larger", label: "تكبير الخط") { sizeStep = min(4, sizeStep + 1) }
                SunnahToolbarButton(systemImage: night ? "sun.max" : "moon", label: night ? "الوضع النهاري" : "وضع الليل") { night.toggle() }
            }
        }
    }
}
