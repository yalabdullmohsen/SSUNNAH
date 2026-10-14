import SwiftUI

/// قالب 2 — تفاصيل عنصر: عنوان + وسوم + نص.
public struct DetailTemplate: View {
    let item: ContentItem
    public init(item: ContentItem) { self.item = item }
    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                Text(item.title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                if let s = item.subtitle { Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                if !item.tags.isEmpty { HStack(spacing: Sunnah.Spacing.s2) { ForEach(item.tags, id: \.self) { SunnahChip($0) } } }
                if let b = item.body { Text(b).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
            }
            .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg).bodyTitledNavigation()
    }
}
