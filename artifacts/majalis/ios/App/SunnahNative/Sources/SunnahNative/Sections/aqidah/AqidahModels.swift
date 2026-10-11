import Foundation

/// نماذج قسم «العقيدة والتزكية» كما تُصدَّر إلى `Data/aqidah/*.json` (انظر docs/native/requests/aqidah.md).
/// الحقول بأسماء مصدر الويب نفسها (camelCase في ملفات TS، وsnake_case في جداول dawah_*) — لا إعادة تسمية للمحتوى.

/// عنصر داخل مجموعة: درس أكورديون (`DarsItem`) أو بطاقة تبويب في صفحات الأخلاق والرقائق وأشراط الساعة…
public struct AqidahEntry: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public var summary: String?
    public var body: String?
    public var reference: String?

    enum CodingKeys: String, CodingKey { case id, title, summary, body, reference }

    public init(id: String, title: String, summary: String? = nil, body: String? = nil, reference: String? = nil) {
        self.id = id; self.title = title; self.summary = summary; self.body = body; self.reference = reference
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        title = try c.decode(String.self, forKey: .title)
        summary = try c.decodeIfPresent(String.self, forKey: .summary).aqidahNonEmpty
        body = try c.decodeIfPresent(String.self, forKey: .body).aqidahNonEmpty
        reference = try c.decodeIfPresent(String.self, forKey: .reference).aqidahNonEmpty
    }
}

/// مجموعة عناصر: قسم أكورديون (`DarsSection`: lessons) أو تبويب (items).
public struct AqidahGroup: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public let entries: [AqidahEntry]

    enum CodingKeys: String, CodingKey { case id, title, items, lessons }

    public init(id: String, title: String, entries: [AqidahEntry]) {
        self.id = id; self.title = title; self.entries = entries
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        title = try c.decode(String.self, forKey: .title)
        entries = try c.decodeIfPresent([AqidahEntry].self, forKey: .items)
            ?? c.decodeIfPresent([AqidahEntry].self, forKey: .lessons) ?? []
    }
}

/// اسم من الأسماء الحسنى (`lib/asma-husna-data.ts`).
public struct AsmaEntry: Decodable, Identifiable, Hashable, Sendable {
    public let num: Int
    public let arabic: String
    public let meaning: String
    public let reference: String
    public let benefit: String
    /// «ثابت» أو «مشهور» — يُعرض كما هو.
    public let status: String
    public let category: String
    public var documentationStatus: String?

    public var id: Int { num }

    enum CodingKeys: String, CodingKey {
        case num, arabic, meaning, reference, benefit, status, category
        case documentationStatus = "documentation_status"
    }
}

/// موضوع من بوابة التوحيد (`lib/tawhid-topics.ts`) — المسار /tawhid/:slug.
public struct TawhidTopic: Decodable, Identifiable, Hashable, Sendable {
    public struct Ayah: Decodable, Hashable, Sendable { public let text: String; public let ref: String }
    public struct Hadith: Decodable, Hashable, Sendable { public let text: String; public let source: String }
    public struct Block: Decodable, Hashable, Sendable {
        public let title: String
        public let body: String
        public var ayah: Ayah?
        public var hadith: Hadith?
    }

    public let id: String
    public let slug: String
    public let title: String
    public let description: String
    public let blocks: [Block]
}

/// فرقة/مدرسة (`data/islamic-sects.ts`) مع حالة النشر من ميتا الحوكمة.
public struct IslamicSect: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let fullName: String
    public let category: String
    public let era: String
    public let origin: String
    public let founder: String
    public let foundingCause: String
    public let keyBeliefs: [String]
    public let keyBooks: [String]
    public let keyScholars: [String]
    public let status: String
    public let spread: String
    public var quote: String?
    /// `publicationStatus` في `islamic-sects` meta؛ يُعرض `PUBLISHED` فقط.
    public var publicationStatus: String?
}

public struct DawahEvidence: Decodable, Hashable, Sendable {
    public let type: String
    public let ref: String
    public var grading: String?
    public let text: String
}

public struct DawahSource: Decodable, Hashable, Sendable {
    public let title: String
    public var author: String?
    public var url: String?
}

/// سؤال من أسئلة التعريف بالإسلام (`dawah_questions`).
public struct DawahQuestion: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let slug: String
    public let title: String
    public let shortAnswer: String
    public let detailedAnswer: String
    public let evidences: [DawahEvidence]
    public let sources: [DawahSource]
    public var targetReligion: String?

    enum CodingKeys: String, CodingKey {
        case id, slug, title, evidences, sources
        case shortAnswer = "short_answer"
        case detailedAnswer = "detailed_answer"
        case targetReligion = "target_religion"
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        slug = try c.decode(String.self, forKey: .slug)
        title = try c.decode(String.self, forKey: .title)
        shortAnswer = try c.decodeIfPresent(String.self, forKey: .shortAnswer) ?? ""
        detailedAnswer = try c.decodeIfPresent(String.self, forKey: .detailedAnswer) ?? ""
        evidences = try c.decodeIfPresent([DawahEvidence].self, forKey: .evidences) ?? []
        sources = try c.decodeIfPresent([DawahSource].self, forKey: .sources) ?? []
        targetReligion = try c.decodeIfPresent(String.self, forKey: .targetReligion)
    }
}

/// شبهة وجوابها (`dawah_shubuhat`).
public struct DawahShubha: Decodable, Identifiable, Hashable, Sendable {
    public struct Objection: Decodable, Hashable, Sendable { public let objection: String; public let response: String }

    public let id: String
    public let slug: String
    public let title: String
    public let shubhaText: String
    public let shortAnswer: String
    public let detailedRefutation: String
    public var assumptionCorrection: String?
    public var historicalLinguisticContext: String?
    public var conclusion: String?
    public let evidences: [DawahEvidence]
    public let sources: [DawahSource]
    public let objectionsAndResponses: [Objection]

    enum CodingKeys: String, CodingKey {
        case id, slug, title, conclusion, evidences, sources
        case shubhaText = "shubha_text"
        case shortAnswer = "short_answer"
        case detailedRefutation = "detailed_refutation"
        case assumptionCorrection = "assumption_correction"
        case historicalLinguisticContext = "historical_linguistic_context"
        case objectionsAndResponses = "objections_and_responses"
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        slug = try c.decode(String.self, forKey: .slug)
        title = try c.decode(String.self, forKey: .title)
        shubhaText = try c.decodeIfPresent(String.self, forKey: .shubhaText) ?? ""
        shortAnswer = try c.decodeIfPresent(String.self, forKey: .shortAnswer) ?? ""
        detailedRefutation = try c.decodeIfPresent(String.self, forKey: .detailedRefutation) ?? ""
        assumptionCorrection = try c.decodeIfPresent(String.self, forKey: .assumptionCorrection).aqidahNonEmpty
        historicalLinguisticContext = try c.decodeIfPresent(String.self, forKey: .historicalLinguisticContext).aqidahNonEmpty
        conclusion = try c.decodeIfPresent(String.self, forKey: .conclusion).aqidahNonEmpty
        evidences = try c.decodeIfPresent([DawahEvidence].self, forKey: .evidences) ?? []
        sources = try c.decodeIfPresent([DawahSource].self, forKey: .sources) ?? []
        objectionsAndResponses = try c.decodeIfPresent([Objection].self, forKey: .objectionsAndResponses) ?? []
    }
}

/// مقال تعريفي (`dawah_articles`) — المسار /discover-islam/articles/:slug.
public struct DawahArticle: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let slug: String
    public let titleAr: String
    public var summaryAr: String?
    public let bodyAr: String
    public var tags: [String]

    enum CodingKeys: String, CodingKey {
        case id, slug, tags
        case titleAr = "title_ar"
        case summaryAr = "summary_ar"
        case bodyAr = "body_ar"
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        slug = try c.decode(String.self, forKey: .slug)
        titleAr = try c.decode(String.self, forKey: .titleAr)
        summaryAr = try c.decodeIfPresent(String.self, forKey: .summaryAr).aqidahNonEmpty
        bodyAr = try c.decodeIfPresent(String.self, forKey: .bodyAr) ?? ""
        tags = try c.decodeIfPresent([String].self, forKey: .tags) ?? []
    }
}

/// يوم من مسار المسلم الجديد (`dawah_new_muslim_path`) — المسار /discover-islam/new-muslim/:day.
public struct NewMuslimDay: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let dayNumber: Int
    public let audience: String
    public let title: String
    public let contentAr: String

    enum CodingKeys: String, CodingKey {
        case id, audience, title
        case dayNumber = "day_number"
        case contentAr = "content_ar"
    }
}

extension Optional where Wrapped == String {
    /// النص الفارغ أو المسافات فقط = غير موجود.
    var aqidahNonEmpty: String? {
        guard let s = self?.trimmingCharacters(in: .whitespacesAndNewlines), !s.isEmpty else { return nil }
        return self
    }
}
