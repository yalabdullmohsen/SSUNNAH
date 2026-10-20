import SwiftUI

/// قالب 3 — نص طويل/مقال مع عناصر القراءة: حجم الخط (Dynamic Type) ووضع الليل. الاختيار يُحفظ.
public struct ArticleTemplate: View {
    let item: ContentItem
    @AppStorage("reader.sizeStep") private var sizeStep = 0
    @AppStorage("reader.night") private var night = false  // يُغيَّر من SunnahReaderDisplayMenu
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
                SunnahReaderDisplayMenu().padding(.horizontal, Sunnah.Spacing.pageX)
                ForEach(sections) { sec in
                    // كل قسم في بطاقة بإطار (لا نص عائم على الخلفية).
                    SunnahCard { SunnahSectionView(section: sec, key: item.id, style: .body) }
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
}
