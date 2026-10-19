import SwiftUI

/// عنصر شبكة المربعات: أيقونة في مربع نعناعي + عنوان + وصف سطرين.
public struct SunnahTileItem: Identifiable, Hashable {
    public let id: String
    public let title: String
    public let subtitle: String?
    public let symbol: String
    public let gold: Bool
    public init(id: String, title: String, subtitle: String? = nil, symbol: String = "doc.text", gold: Bool = false) {
        self.id = id; self.title = title; self.subtitle = (subtitle?.contains(where: { $0.isLetter || $0.isNumber }) ?? false) ? subtitle : nil; self.symbol = symbol; self.gold = gold
    }
}

/// شبكة مربعات بعمودين (النموذج ٢): بديل صفوف القوائم ذات السهم. اللمس على المربع كله، والدخول بنقرة واحدة.
/// المعرّف لكل مربع: `<idPrefix>.<item.id>`.
public struct SunnahTileGrid: View {
    let items: [SunnahTileItem]; let idPrefix: String; let onSelect: (SunnahTileItem) -> Void
    public init(_ items: [SunnahTileItem], idPrefix: String = "tile", onSelect: @escaping (SunnahTileItem) -> Void) {
        self.items = items; self.idPrefix = idPrefix; self.onSelect = onSelect
    }
    public var body: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)], spacing: 14) {
            ForEach(items) { item in
                Button { Sunnah.Haptics.select(); onSelect(item) } label: {
                    SunnahTile(title: item.title.arabicDigits, subtitle: item.subtitle?.arabicDigits, symbol: item.symbol, tone: item.gold ? .gold : .mint)
                }
                .buttonStyle(.plain).sunnahPressable()
                .accessibilityIdentifier("\(idPrefix).\(item.id)")
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}
