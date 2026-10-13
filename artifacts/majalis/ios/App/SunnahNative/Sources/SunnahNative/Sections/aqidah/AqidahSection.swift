import SwiftUI

/// قسم «العقيدة والتزكية» (27 مسارًا) بنماذجه الخاصة فوق `Data/aqidah`.
/// الربط (ملف مشترك، لـن2/ن3): `AqidahSection.register(in:)` بعد `GeneratedScreens.registerAll` فيحلّ محلّ
/// معرّفات AqidahScreens المولَّدة نفسها، و`AqidahSection.resolve(path:)` قبل `GeneratedScreens.resolve`.
public enum AqidahSection {
    /// المسارات بلا معاملات (21) — المعرّف = المسار بالنقطة بدل الشرطة المائلة.
    public static let ids: [String] = [
        "adab-talab-ilm", "akhlaq", "alamat-saah", "amrad-qalbiyya", "asma-husna",
        "discover-islam", "discover-islam.contact", "discover-islam.doubts", "discover-islam.how-to-convert",
        "discover-islam.new-muslim", "discover-islam.questions", "hikam-salaf", "iman-topics", "islamic-sects",
        "janna-naar", "malaika", "raqaiq", "tawhid", "tazkiya", "tazkiya-topics", "usra-mujtama",
    ]

    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(AqidahGroupedScreen<AqidahAdabTalabIlmPage>.self)
        registry.register(AqidahGroupedScreen<AqidahAkhlaqPage>.self)
        registry.register(AqidahGroupedScreen<AqidahAlamatSaahPage>.self)
        registry.register(AqidahGroupedScreen<AqidahAmradQalbiyyaPage>.self)
        registry.register(AqidahGroupedScreen<AqidahHikamSalafPage>.self)
        registry.register(AqidahGroupedScreen<AqidahJannaNaarPage>.self)
        registry.register(AqidahGroupedScreen<AqidahMalaikaPage>.self)
        registry.register(AqidahGroupedScreen<AqidahRaqaiqPage>.self)
        registry.register(AqidahGroupedScreen<AqidahImanTopicsPage>.self)
        registry.register(AqidahGroupedScreen<AqidahTazkiyaTopicsPage>.self)
        registry.register(AqidahGroupedScreen<AqidahUsraMujtamaPage>.self)
        registry.register(AqidahGroupedScreen<AqidahHowToConvertPage>.self)
        registry.register(AqidahAsmaHusnaNativeScreen.self)
        registry.register(AqidahTawhidNativeScreen.self)
        registry.register(AqidahIslamicSectsNativeScreen.self)
        registry.register(AqidahTazkiyaNativeScreen.self)
        registry.register(AqidahDiscoverIslamNativeScreen.self)
        registry.register(AqidahDiscoverIslamQuestionsNativeScreen.self)
        registry.register(AqidahDiscoverIslamDoubtsNativeScreen.self)
        registry.register(AqidahNewMuslimPathScreen.self)
        registry.registerView(id: "discover-islam.contact") { AqidahDiscoverIslamContactNativeScreen() }
    }

    /// مسار ذو معامل → نوع الوجهة (منطق خالص قابل للاختبار).
    public enum Destination: Equatable {
        case article(slug: String), doubt(slug: String), question(slug: String)
        case newMuslimDay(Int), sect(id: String), tawhidTopic(slug: String)
    }

    public static func destination(path: String) -> Destination? {
        let c = Route.normalize(path).split(separator: "?").first.map { $0.split(separator: "/").map(String.init) } ?? []
        switch (c.count, c.first ?? "") {
        case (3, "discover-islam"):
            switch c[1] {
            case "articles": return .article(slug: c[2])
            case "doubts": return .doubt(slug: c[2])
            case "questions": return .question(slug: c[2])
            case "new-muslim": return Int(c[2]).map(Destination.newMuslimDay)
            default: return nil
            }
        case (2, "islamic-sects"): return .sect(id: c[1])
        case (2, "tawhid"): return .tawhidTopic(slug: c[1])
        default: return nil
        }
    }

    public static func resolve(path: String) -> AnyView? {
        guard let d = destination(path: path) else { return nil }
        switch d {
        case .article(let slug):
            return AnyView(AqidahItemHost(file: "discover-islam-articles",
                                          pick: { (v: [DawahArticle]) in AqidahContent.accepted(v).first { $0.slug == slug } },
                                          content: { AqidahArticleView(article: $0) }))
        case .doubt(let slug):
            return AnyView(AqidahItemHost(file: "discover-islam-doubts",
                                          pick: { (v: [DawahShubha]) in AqidahContent.accepted(v).first { $0.slug == slug } },
                                          content: { AqidahShubhaView(shubha: $0) }))
        case .question(let slug):
            return AnyView(AqidahItemHost(file: "discover-islam-questions",
                                          pick: { (v: [DawahQuestion]) in AqidahContent.accepted(v).first { $0.slug == slug } },
                                          content: { AqidahQuestionView(question: $0) }))
        case .newMuslimDay(let n):
            return AnyView(AqidahItemHost(file: "discover-islam-new-muslim",
                                          pick: { (v: [NewMuslimDay]) in AqidahContent.accepted(v).first { $0.dayNumber == n } },
                                          content: { AqidahNewMuslimDayView(day: $0) }))
        case .sect(let id):
            return AnyView(AqidahItemHost(file: "islamic-sects",
                                          missingTitle: "سجل غير متاح",
                                          missingMessage: "هذا السجل غير متاح للعامة بعد. تصفّح الأقسام الأخرى أو عد لاحقًا.",
                                          pick: { (v: [IslamicSect]) in AqidahContent.accepted(v).first { $0.id == id } },
                                          content: { AqidahIslamicSectView(sect: $0) }))
        case .tawhidTopic(let slug):
            return AnyView(AqidahItemHost(file: "tawhid",
                                          pick: { (v: [TawhidTopic]) in AqidahContent.accepted(v).first { $0.slug == slug } },
                                          content: { AqidahTawhidTopicView(topic: $0) }))
        }
    }
}
