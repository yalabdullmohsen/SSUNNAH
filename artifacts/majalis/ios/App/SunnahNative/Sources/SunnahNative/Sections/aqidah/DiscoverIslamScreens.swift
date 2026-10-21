import SwiftUI

// MARK: البوابة — /discover-islam

/// مداخل التعريف بالإسلام ثم المقالات المصدَّرة.
public struct AqidahDiscoverIslamNativeScreen: ScreenTemplate {
    public static let id = "discover-islam"
    public static let title = "تعرّف إلى الإسلام"
    public static let source = AqidahContent.source("discover-islam-articles")

    struct Entry: Identifiable { let id: String; let title: String; let route: String }
    static let entries: [Entry] = [
        Entry(id: "questions", title: "أسئلة وأجوبة", route: "/discover-islam/questions"),
        Entry(id: "doubts", title: "الشبهات والتفنيدات", route: "/discover-islam/doubts"),
        Entry(id: "how-to-convert", title: "كيف أصبح مسلمًا؟", route: "/discover-islam/how-to-convert"),
        Entry(id: "new-muslim", title: "مسار الثلاثين يومًا", route: "/discover-islam/new-muslim"),
        Entry(id: "contact", title: "تواصل سرّي مع داعية", route: "/discover-islam/contact"),
    ]

    let articles: [DawahArticle]
    public init(content: [DawahArticle]) { articles = AqidahContent.accepted(content) }

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                AqidahLinkList(items: Self.entries, title: { $0.title }, subtitle: { _ in nil }, path: { $0.route })
                if !articles.isEmpty {
                    Text("مقالات").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                    AqidahLinkList(items: articles, title: { $0.titleAr }, subtitle: { $0.summaryAr },
                                   path: { "/discover-islam/articles/" + $0.slug }, symbol: "doc.text")
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
    }
}

struct AqidahArticleView: View {
    let article: DawahArticle

    var body: some View {
        AqidahPage(title: article.titleAr, hero: article.titleAr) {
            if let s = article.summaryAr { Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
            AqidahParagraphs(text: article.bodyAr)
        }
    }
}

// MARK: الأسئلة — /discover-islam/questions و /:slug

public struct AqidahDiscoverIslamQuestionsNativeScreen: ScreenTemplate {
    public static let id = "discover-islam.questions"
    public static let title = "أسئلة وأجوبة"
    public static let source = AqidahContent.source("discover-islam-questions")

    let questions: [DawahQuestion]
    @State private var query = ""
    public init(content: [DawahQuestion]) { questions = AqidahContent.accepted(content) }

    public var body: some View {
        let shown = questions.filter { AqidahContent.matches(query, [$0.title, $0.shortAnswer]) }
        Group {
            if questions.isEmpty { EmptyStateView() }
            else {
                ScrollView {
                    VStack(spacing: Sunnah.Spacing.s3) {
                        SunnahSearchField(text: $query, prompt: "ابحث في الأسئلة", idPrefix: "sunnah.searchable")
                        if shown.isEmpty { EmptyStateView(title: "لا نتائج مطابقة") }
                        else {
                            AqidahLinkList(items: shown, title: { $0.title }, subtitle: { $0.shortAnswer },
                                           path: { "/discover-islam/questions/" + $0.slug }, symbol: "questionmark.circle")
                                .padding(.horizontal, Sunnah.Spacing.pageX)
                        }
                    }
                    .padding(.vertical, Sunnah.Spacing.s2)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("أسئلة وأجوبة")
    }
}

struct AqidahQuestionView: View {
    let question: DawahQuestion

    var body: some View {
        AqidahPage(title: question.title, hero: question.title) {
            if !question.shortAnswer.aqidahIsBlank { AqidahTextBlock(title: "الجواب المختصر", text: question.shortAnswer) }
            if !question.detailedAnswer.aqidahIsBlank { AqidahTextBlock(title: "الجواب المفصّل", text: question.detailedAnswer) }
            AqidahEvidenceList(evidences: question.evidences)
            AqidahSourcesList(sources: question.sources)
        }
    }
}

// MARK: الشبهات — /discover-islam/doubts و /:slug

public struct AqidahDiscoverIslamDoubtsNativeScreen: ScreenTemplate {
    public static let id = "discover-islam.doubts"
    public static let title = "الشبهات والتفنيدات"
    public static let source = AqidahContent.source("discover-islam-doubts")

    let doubts: [DawahShubha]
    public init(content: [DawahShubha]) { doubts = AqidahContent.accepted(content) }

    public var body: some View {
        if doubts.isEmpty { EmptyStateView() } else {
            ScrollView {
                AqidahLinkList(items: doubts, title: { $0.title }, subtitle: { $0.shortAnswer },
                               path: { "/discover-islam/doubts/" + $0.slug })
                    .padding(Sunnah.Spacing.pageX)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}

struct AqidahShubhaView: View {
    let shubha: DawahShubha

    var body: some View {
        AqidahPage(title: shubha.title, hero: shubha.title) {
            if !shubha.shubhaText.aqidahIsBlank { AqidahTextBlock(title: "نص الشبهة", text: shubha.shubhaText) }
            if !shubha.shortAnswer.aqidahIsBlank { AqidahTextBlock(title: "الجواب المختصر", text: shubha.shortAnswer) }
            if !shubha.detailedRefutation.aqidahIsBlank { AqidahTextBlock(title: "التفنيد المفصّل", text: shubha.detailedRefutation) }
            if let a = shubha.assumptionCorrection { AqidahTextBlock(title: "تصحيح الافتراضات", text: a) }
            if let h = shubha.historicalLinguisticContext { AqidahTextBlock(title: "السياق التاريخي واللغوي", text: h) }
            if !shubha.objectionsAndResponses.isEmpty {
                Text("اعتراضات وردود").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                ForEach(Array(shubha.objectionsAndResponses.enumerated()), id: \.offset) { _, o in
                    AqidahTextBlock(title: o.objection, text: o.response)
                }
            }
            if let c = shubha.conclusion { AqidahTextBlock(title: "الخلاصة", text: c) }
            AqidahEvidenceList(evidences: shubha.evidences)
            AqidahSourcesList(sources: shubha.sources)
        }
    }
}
