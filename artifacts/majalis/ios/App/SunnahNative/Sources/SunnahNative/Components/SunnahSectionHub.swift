import SwiftUI

/// محور القسم (النموذج ٢): بطاقات كبيرة بزوايا ناعمة، لكل منها أيقونة وعنوان ووصف وعدد عناصرها، تفتح المحتوى مباشرة.
/// يحلّ محل «قائمة داخل قائمة» في صفحات الأقسام؛ العدّاد يظهر فقط حين يُعرف.
public struct SunnahSectionHub: View {
    @Environment(\.openRoute) private var openRoute
    let links: [SectionLink]
    let counts: [String: Int]
    let idPrefix: String
    private let columns = [GridItem(.flexible(), spacing: Sunnah.Spacing.s2), GridItem(.flexible(), spacing: Sunnah.Spacing.s2)]

    public init(links: [SectionLink], counts: [String: Int] = [:], idPrefix: String = "hub") {
        self.links = links; self.counts = counts; self.idPrefix = idPrefix
    }

    public var body: some View {
        LazyVGrid(columns: columns, spacing: Sunnah.Spacing.s2) {
            ForEach(Array(links.enumerated()), id: \.element.id) { i, link in
                Button { Sunnah.Haptics.select(); openRoute(link.route) } label: { card(link, gold: i % 3 == 1) }
                    .buttonStyle(.plain).sunnahPressable()
                    .accessibilityIdentifier("\(idPrefix).\(link.route)")
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }

    private func card(_ link: SectionLink, gold: Bool) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                SunnahIconTile(Self.symbol(for: link.route), tone: gold ? .gold : .mint, size: 44)
                Spacer(minLength: 4)
                if let n = counts[link.route] ?? link.count {
                    Text(Sunnah.digits("\(n)"))
                        .font(AppearancePrefs.ui(.extraBold, 12, .caption)).foregroundStyle(Sunnah.Colors.primary)
                        .padding(.horizontal, 10).frame(minHeight: 26)
                        .background(Sunnah.Colors.primarySoft, in: Capsule())
                        .accessibilityLabel("\(Sunnah.digits("\(n)")) عنصرًا")
                }
            }
            Text(link.title).font(AppearancePrefs.ui(.extraBold, 16, .headline)).foregroundStyle(Sunnah.Colors.textPrimary).lineLimit(2)
            if let s = link.subtitle, !s.isEmpty {
                Text(s).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(3)
            }
            Spacer(minLength: 0)
        }
        .padding(16)
        .frame(maxWidth: .infinity, minHeight: 148, alignment: .topLeading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .contentShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
        .accessibilityElement(children: .combine)
    }

    /// أيقونة وصفية من المسار؛ الأصل `doc.text`.
    static func symbol(for route: String) -> String {
        switch route {
        case "/academic-research", "/academic-research/assistant": return "magnifyingglass"
        case "/academic-research/submit": return "square.and.pencil"
        case "/arabic-language": return "textformat"
        case "/cards": return "rectangle.stack"
        case "/islamic-directory": return "building.columns"
        case "/islamic-glossary": return "character.book.closed"
        case "/mawsuaat": return "books.vertical"
        case "/universities": return "graduationcap"
        case "/institutions": return "building.2"
        case "/islamic-landmarks": return "mappin.and.ellipse"
        default: return "doc.text"
        }
    }
}
