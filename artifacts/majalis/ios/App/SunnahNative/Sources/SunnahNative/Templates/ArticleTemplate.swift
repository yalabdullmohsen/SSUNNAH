import SwiftUI

/// قالب 3 — نص طويل/مقال: فقرات مفصولة بسطر فارغ، تباعد قراءة مريح.
public struct ArticleTemplate: View {
    let section: String; let id: String
    public init(section: String, id: String) { self.section = section; self.id = id }
    public var body: some View {
        Loaded(load: { try await $0.item(section: section, id: id) }, isEmpty: { _ in false }) { item in
            ScrollView {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                    Text(item.title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    ForEach(Array((item.body ?? "").components(separatedBy: "\n\n").enumerated()), id: \.offset) { _, p in
                        Text(p).font(Sunnah.Typography.body).lineSpacing(Sunnah.Spacing.s2)
                            .foregroundStyle(Sunnah.Colors.textPrimary)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.pageX)
            }
        }
        .background(Sunnah.Colors.bg)
    }
}
