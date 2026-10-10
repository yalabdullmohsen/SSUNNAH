import SwiftUI

public struct SunnahCard<Content: View>: View {
    let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Sunnah.Spacing.s4)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card).stroke(Sunnah.Colors.surface2, lineWidth: Sunnah.Spacing.hairline))
    }
}

/// بطاقة محتوى جاهزة: عنوان + سطر ثانوي + وسوم.
public struct ContentCard: View {
    let item: ContentItem
    public init(_ item: ContentItem) { self.item = item }
    public var body: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                Text(item.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                if let s = item.subtitle { Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(3) }
                if !item.tags.isEmpty { HStack(spacing: Sunnah.Spacing.s2) { ForEach(item.tags.prefix(3), id: \.self) { SunnahChip($0) } } }
            }
        }
    }
}
