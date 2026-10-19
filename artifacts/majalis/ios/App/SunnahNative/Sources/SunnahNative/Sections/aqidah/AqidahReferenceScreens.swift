import SwiftUI

// MARK: الأسماء الحسنى — /asma-husna

/// شبكة الأسماء مع بحث وتصنيف؛ النقر يعرض المعنى والشاهد والأثر وحالة الثبوت كما في المصدر.
public struct AqidahAsmaHusnaNativeScreen: ScreenTemplate {
    public static let id = "asma-husna"
    public static let title = "الأسماء الحسنى"
    public static let source = AqidahContent.source("asma-husna")

    let names: [AsmaEntry]
    @State private var query = ""
    @State private var category: String?
    @State private var selected: AsmaEntry?

    public init(content: [AsmaEntry]) { names = AqidahContent.accepted(content) }

    private var categories: [String] {
        var seen = Set<String>()
        return names.map(\.category).filter { seen.insert($0).inserted }
    }

    private var shown: [AsmaEntry] {
        names.filter { n in
            (category == nil || n.category == category)
                && AqidahContent.matches(query, [n.arabic, n.meaning, n.category])
        }
    }

    public var body: some View {
        Group {
            if names.isEmpty {
                EmptyStateView()
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: Sunnah.Spacing.s2) {
                                chip("الكل", value: nil)
                                ForEach(categories, id: \.self) { chip($0, value: $0) }
                            }
                        }
                        if shown.isEmpty {
                            EmptyStateView(title: "لا نتائج مطابقة")
                        } else {
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: Sunnah.Spacing.cardMinWidth), spacing: Sunnah.Spacing.s3)],
                                      spacing: Sunnah.Spacing.s3) {
                                ForEach(shown) { n in
                                    Button { selected = n } label: {
                                        SunnahCard {
                                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                                Text(n.arabic).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                                                Text(n.meaning).font(Sunnah.Typography.secondary)
                                                    .foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(2)
                                            }
                                        }
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                    .padding(Sunnah.Spacing.pageX)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .sunnahSearchable(text: $query, prompt: "ابحث عن اسم أو معنى")
        .navigationDestination(isPresented: Binding(get: { selected != nil }, set: { if !$0 { selected = nil } })) {
            if let n = selected {
                AqidahPage(title: n.arabic) {
                    HStack(spacing: Sunnah.Spacing.s2) { SunnahChip(n.status, selected: true); SunnahChip(n.category) }
                    AqidahTextBlock(title: "المعنى", text: n.meaning)
                    AqidahQuote(text: n.reference, reference: "الشاهد")
                    AqidahTextBlock(title: "الأثر", text: n.benefit)
                }
            }
        }
    }

    private func chip(_ label: String, value: String?) -> some View {
        Button { category = value } label: { SunnahChip(label, selected: category == value) }
            .buttonStyle(.plain)
            .frame(minHeight: Sunnah.Spacing.touch)
    }
}

// MARK: التوحيد — /tawhid و /tawhid/:slug

public struct AqidahTawhidNativeScreen: ScreenTemplate {
    public static let id = "tawhid"
    public static let title = "العقيدة والتوحيد"
    public static let source = AqidahContent.source("tawhid")

    let topics: [TawhidTopic]
    public init(content: [TawhidTopic]) { topics = AqidahContent.accepted(content) }

    public var body: some View {
        if topics.isEmpty { EmptyStateView() } else {
            ScrollView {
                AqidahLinkList(items: topics, title: { $0.title }, subtitle: { $0.description }, path: { "/tawhid/" + $0.slug })
                    .padding(Sunnah.Spacing.pageX)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}

struct AqidahTawhidTopicView: View {
    let topic: TawhidTopic

    var body: some View {
        AqidahPage(title: topic.title) {
            Text(topic.description).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            ForEach(Array(topic.blocks.enumerated()), id: \.offset) { _, block in
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                        Text(block.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary)
                            .accessibilityAddTraits(.isHeader)
                        AqidahParagraphs(text: block.body)
                        if let a = block.ayah { AqidahQuote(text: a.text, reference: a.ref) }
                        if let h = block.hadith { AqidahQuote(text: h.text, reference: h.source) }
                    }
                }
            }
        }
    }
}

// MARK: الفرق الإسلامية — /islamic-sects و /islamic-sects/:id

public struct AqidahIslamicSectsNativeScreen: ScreenTemplate {
    public static let id = "islamic-sects"
    public static let title = "الفرق الإسلامية"
    public static let source = AqidahContent.source("islamic-sects")

    let sects: [IslamicSect]
    @State private var query = ""
    public init(content: [IslamicSect]) { sects = AqidahContent.accepted(content) }

    public var body: some View {
        let shown = sects.filter { AqidahContent.matches(query, [$0.name, $0.fullName, $0.category, $0.era]) }
        Group {
            if sects.isEmpty {
                EmptyStateView(title: "لا توجد سجلات منشورة",
                               message: "يُعرض للعامة ما اكتملت مراجعته واعتماده فقط. لا فتوى شرعية من التطبيق.")
            }
            else if shown.isEmpty { EmptyStateView(title: "لا نتائج مطابقة") }
            else {
                ScrollView {
                    AqidahLinkList(items: shown, title: { $0.name }, subtitle: { ([$0.publicationStatus == AqidahContent.underReview ? "قيد المراجعة" : "", $0.category, $0.era].filter { !$0.isEmpty }).joined(separator: " · ") }, path: { "/islamic-sects/" + $0.id })
                        .padding(Sunnah.Spacing.pageX)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .sunnahSearchable(text: $query, prompt: "ابحث عن فرقة")
    }
}

struct AqidahIslamicSectView: View {
    let sect: IslamicSect

    var body: some View {
        AqidahPage(title: sect.name, hero: sect.fullName) {
            HStack(spacing: Sunnah.Spacing.s2) {
                SunnahChip(sect.category, selected: true); if !sect.status.aqidahIsBlank { SunnahChip(sect.status) }
                if sect.publicationStatus == AqidahContent.underReview { SunnahChip("قيد المراجعة") }
            }
            block("النشأة", [sect.era, sect.origin].filter { !$0.isEmpty }.joined(separator: "\n\n"))
            block("المؤسس", sect.founder)
            block("سبب النشأة", sect.foundingCause)
            bullets("أبرز المعتقدات", sect.keyBeliefs)
            bullets("أبرز الكتب", sect.keyBooks)
            bullets("أبرز الأعلام", sect.keyScholars)
            block("الانتشار", sect.spread)
            bullets("المراجع", sect.references ?? [])
            if let q = sect.quote { AqidahQuote(text: q, reference: sect.name) }
        }
    }

    @ViewBuilder private func block(_ title: String, _ text: String) -> some View {
        if !text.isEmpty { AqidahTextBlock(title: title, text: text) }
    }

    @ViewBuilder private func bullets(_ title: String, _ items: [String]) -> some View {
        if !items.isEmpty {
            AqidahTextBlock(title: title, text: items.map { "• " + $0 }.joined(separator: "\n\n"))
        }
    }
}

// MARK: التزكية — /tazkiya (بوابة أقسام؛ الروابط من ملف التصدير)

public struct AqidahTazkiyaNativeScreen: ScreenTemplate {
    public static let id = "tazkiya"
    public static let title = "التزكية والتوبة"
    public static let source = AqidahContent.source("tazkiya")

    let links: [SectionLink]
    public init(content: [SectionLink]) { links = content }
    public var body: some View { SectionsListTemplate(links: links) }
}
