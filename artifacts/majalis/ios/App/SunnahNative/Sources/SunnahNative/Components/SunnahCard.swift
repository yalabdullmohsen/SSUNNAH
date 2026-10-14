import SwiftUI

public struct SunnahCard<Content: View>: View {
    let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Sunnah.Spacing.s4)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card).stroke(Sunnah.Colors.border, lineWidth: Sunnah.Spacing.hairline))
            .sunnahElevation()
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

extension View {
    /// صف قائمة بشكل بطاقة «سُنّة»: أبيض بحد #E6DFCF وزوايا 20 بلا فواصل النظام.
    func sunnahRowChrome() -> some View {
        self.padding(.horizontal, 14).padding(.vertical, 12)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
            .listRowBackground(Color.clear)
            .listRowSeparator(.hidden)
            .listRowInsets(EdgeInsets(top: 5, leading: Sunnah.Spacing.s4, bottom: 5, trailing: Sunnah.Spacing.s4))
    }
}
