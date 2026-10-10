import SwiftUI

/// قالب 3 — نص طويل/مقال: فقرات مفصولة بسطر فارغ، تباعد قراءة مريح.
public struct ArticleTemplate: View {
    let item: ContentItem
    public init(item: ContentItem) { self.item = item }
    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                Text(item.title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                ForEach(Array((item.body ?? "").components(separatedBy: "\n\n").enumerated()), id: \.offset) { _, p in
                    Text(p).font(Sunnah.Typography.body).lineSpacing(Sunnah.Spacing.s2).foregroundStyle(Sunnah.Colors.textPrimary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg).navigationTitle(item.title)
    }
}
