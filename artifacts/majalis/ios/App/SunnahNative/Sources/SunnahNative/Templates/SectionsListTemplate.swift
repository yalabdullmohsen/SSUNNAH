import SwiftUI

/// قالب 8 — محور أقسام: بطاقات كبيرة تفتح الشاشات الفرعية مباشرة (SunnahSectionHub).
public struct SectionsListTemplate: View {
    @Environment(\.openRoute) private var openRoute
    let links: [SectionLink]
    public init(links: [SectionLink]) { self.links = links }
    public var body: some View {
        if links.isEmpty { EmptyStateView() } else {
            ScrollView {
                SunnahSectionHub(links: links, idPrefix: "sections.hub")
                    .padding(.top, Sunnah.Spacing.pageX).padding(.bottom, 96)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}
