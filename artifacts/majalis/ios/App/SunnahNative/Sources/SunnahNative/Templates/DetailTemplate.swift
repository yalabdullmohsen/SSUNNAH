import SwiftUI

/// قالب 2 (v5) — تفاصيل عنصر: ترويسة خضراء منقوشة (وسم ذهبي + عنوان + وصف) ثم بطاقة نص بيضاء متداخلة معها (مرجع LessonDetail).
public struct DetailTemplate: View {
    let item: ContentItem
    public init(item: ContentItem) { self.item = item }
    public var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                DetailHero(title: item.title, subtitle: item.subtitle, tags: item.tags)
                if let b = item.body, !b.isEmpty {
                    SunnahSectionedMarkdown(b, key: item.id, style: .body)
                        .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.s4)
                        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
                        .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, -28).padding(.bottom, Sunnah.Spacing.s5)
                        .sunnahReadableWidth()
                }
            }
        }
        .background(Sunnah.Colors.bg).bodyTitledNavigation()
    }
}

/// ترويسة تفاصيل v5: خلفية خضراء منقوشة، وسم ذهبي، عنوان أبيض، وصف؛ تمتد تحت شريط التنقل.
struct DetailHero: View {
    let title: String; var subtitle: String? = nil; var tags: [String] = []
    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            if let t = tags.first { Text(t).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.goldDeco) }
            Text(title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.onHero).accessibilityAddTraits(.isHeader)
            if let s = subtitle, !s.isEmpty { Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Color.white.opacity(0.82)) }
            if tags.count > 1 { HStack(spacing: Sunnah.Spacing.s2) { ForEach(tags.dropFirst(), id: \.self) { SunnahChip($0) } } }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, Sunnah.Spacing.s5).padding(.bottom, 44)
        .heroNavigationBar()
        .background { ZStack { Sunnah.Colors.primaryStrong; SunnahStarPattern().opacity(0.9) }.ignoresSafeArea(edges: .top) }
    }
}
