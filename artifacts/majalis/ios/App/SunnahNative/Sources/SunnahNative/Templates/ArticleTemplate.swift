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
                readerControls
                ForEach(sections) { sec in
                    SunnahSectionView(section: sec, key: item.id, style: .body)
                        .padding(.horizontal, Sunnah.Spacing.pageX)
                }
                SunnahContentFooter(title: item.title, id: item.id, section: item.reportSection)
            }
            .frame(maxWidth: .infinity, alignment: .leading).padding(.bottom, Sunnah.Spacing.pageX)
        }
        .dynamicTypeSize(size)
        .sunnahReadableWidth().background(Sunnah.Colors.bg).bodyTitledNavigation()
        .preferredColorScheme(night ? .dark : nil)
        .sunnahReportIssueToolbar(title: item.title, id: item.id, section: item.reportSection)
    }

    /// أدوات القراءة داخل الصفحة (لا شريط تنقل نظام): حجم الخط ووضع الليل.
    private var readerControls: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            SunnahRoundButton(symbol: "textformat.size.smaller", label: "تصغير الخط") { sizeStep = max(-2, sizeStep - 1) }
            SunnahRoundButton(symbol: "textformat.size.larger", label: "تكبير الخط") { sizeStep = min(4, sizeStep + 1) }
            SunnahRoundButton(symbol: night ? "sun.max" : "moon", label: night ? "الوضع النهاري" : "وضع الليل") { night.toggle() }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}
