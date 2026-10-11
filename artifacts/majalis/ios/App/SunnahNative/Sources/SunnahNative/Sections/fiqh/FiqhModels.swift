import Foundation

// نماذج قسم «الفقه والعبادات» كما هي في مصادرها (لا إعادة تصميم):
// - كتب الفقه: `content/fiqh/books.json` و`book-aliases.json` (أنواع src/lib/fiqh-books.ts).
// - بقية الملفات تُصدَّر من وحدات TS المذكورة فوق كل نموذج (انظر docs/native/requests/fiqh.md).
// الحقول غير الإلزامية اختيارية حتى لا يُسقط حقلٌ ناقص في عنصر واحد الكتالوجَ كله؛ قواعد النشر في FiqhVisibility.

// MARK: - كتب الفقه

public struct FiqhSource: Decodable, Hashable, Sendable {
    public var book: String?
    public var author: String?
    public var ref: String?
}

public struct FiqhLesson: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var bookId: String?
    public var chapterId: String?
    public var level: String?
    public var status: String?
    public var needsReview: Bool?
    public var summary: String?
    public var evidence: String?
    public var preferred: String?
    public var definition: String?
    public var ruling: String?
    public var notes: String?
    public var practicalSummary: String?
    public var madhhabNotes: String?
    public var scholarlyNotes: String?
    public var keywords: [String]?
    public var commonMistakes: [String]?
    public var examples: [String]?
    public var reviewQuestions: [String]?
    public var sources: [FiqhSource]?
}

public struct FiqhChapter: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var order: Int?
    public var status: String?
    public var definition: String?
    public var topics: [String]?
    public var summary: String?
    public var evidence: String?
    public var notes: String?
    public var sources: [FiqhSource]?
    public var lessons: [FiqhLesson]
}

public struct FiqhBook: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var description: String?
    public var orderReason: String?
    /// ibadat | muamalat | usrah | jinayat | qada
    public var category: String?
    public var order: Int?
    public var status: String?
    public var aliases: [String]?
    public var sources: [FiqhSource]?
    public var chapters: [FiqhChapter]
}

/// `content/fiqh/books.json` = `{version, generatedAt, madhhab, books, notes}`؛ نحتاج الكتب فقط.
public struct FiqhCatalog: Decodable, Hashable, Sendable {
    public var books: [FiqhBook]
}

public struct FiqhBookAlias: Decodable, Hashable, Sendable {
    public let aliasTitle: String
    public let aliasId: String
    public let targetBookId: String
    public var targetChapterId: String?
}

/// `content/fiqh/book-aliases.json` = `{aliases:[...]}`.
public struct FiqhAliasList: Decodable, Hashable, Sendable {
    public var aliases: [FiqhBookAlias]
}

// MARK: - أدلة الأبواب (src/lib/fiqh-guides/*.ts: jumuah, nikah, riba, ruqya, sadaqa, talaq, udhiya, waqf)

public struct FiqhGuideCard: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var summary: String?
    public var points: [String]?
    public var evidence: String?
    public var evidenceRef: String?
    public var note: String?
}

public struct FiqhGuideTab: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let label: String
    public var intro: String?
    public var cards: [FiqhGuideCard]
}

public struct FiqhGuideLink: Decodable, Hashable, Sendable {
    public let href: String
    public let label: String
}

/// FiqhGuideSection: حقول SEO وquizCategoryId (نص أو مصفوفة) لا تُفكّ لأنها لا تُعرض.
public struct FiqhGuide: Decodable, Hashable, Sendable {
    public let slug: String
    public let title: String
    public var badge: String?
    public var subtitle: String?
    public var methodology: String?
    public var related: [FiqhGuideLink]?
    public var tabs: [FiqhGuideTab]
}

// MARK: - المذاهب (src/data/madhahib.ts — MADHAHIB)

public struct Madhhab: Decodable, Hashable, Sendable, Identifiable {
    public struct Book: Decodable, Hashable, Sendable { public let title: String; public let author: String }
    public struct Quote: Decodable, Hashable, Sendable { public let text: String; public let source: String }

    public let id: String
    public let name: String
    public var fullName: String?
    public var founder: String?
    public var born: String?
    public var died: String?
    public var origin: String?
    public var spread: String?
    public var summary: String?
    public var methodology: String?
    public var sources: [String]?
    public var features: [String]?
    public var books: [Book]?
    public var scholars: [String]?
    public var quote: Quote?
}

// MARK: - فهرس الدروس الأكورديون (src/lib/maqasid-sharia-data.ts — MAQASID_SHARIA؛ النوع src/lib/dars-types.ts)

public struct DarsItem: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var summary: String?
    public var body: String?
}

public struct DarsSection: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public var num: String?
    public let title: String
    public var lessons: [DarsItem]
}

// MARK: - مراتب المصلين (src/lib/prayer-ranks-data.ts — RANKS؛ بلا معرّف فيُستعمل الترتيب)

public struct PrayerRank: Decodable, Hashable, Sendable {
    public let title: String
    public let label: String
    public var ruling: String?
    public var text: String?
    public var benefit: String?
}

// MARK: - أصول الفقه (src/lib/fiqh/fiqh-usul-topics.ts — USUL_HUB_TOPICS)

public struct UsulDetailBlock: Decodable, Hashable, Sendable {
    public let title: String
    public var summary: String?
    public var evidence: String?
    public var source: FiqhSource?
}

public struct UsulTopic: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var summary: String?
    public var kind: String?
    /// ready | structure
    public var status: String?
    public var href: String?
    public var source: FiqhSource?
    public var details: [UsulDetailBlock]?
}

// MARK: - الذنوب والحقوق (src/lib/sins-rights-data.ts — SINS_TOPICS وSINS_CATEGORIES؛ الأنواع sins-rights-types.ts)

public struct SinEvidence: Decodable, Hashable, Sendable {
    public let text: String
    public var source: String?
    public var grade: String?
}

public struct RepentanceConditions: Decodable, Hashable, Sendable {
    public var general: [String]?
    public var requiresRestitution: Bool?
    public var restitutionDetails: String?
    public var requiresForgiveness: Bool?
    public var forgivenessDetails: String?
    public var hasExpiation: Bool?
    public var expiationDetails: String?
    public var ifOwnerUnreachable: String?
}

public struct SinTopic: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let slug: String
    public let title: String
    public var shortDescription: String?
    public var rightsCategory: String?
    public var sinSeverity: String?
    public var quranEvidence: [SinEvidence]?
    public var hadithEvidence: [SinEvidence]?
    public var explanation: String?
    public var effects: [String]?
    public var repentanceConditions: RepentanceConditions?
    public var commonMistakes: [String]?
    public var relatedSlugs: [String]?
    public var references: [String]?
    /// reviewed | pending | draft
    public var reviewStatus: String?
}

public struct SinCategory: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var subtitle: String?
    public var topicSlugs: [String]
}

/// الشكل المحزوم: `{topics: SINS_TOPICS, categories: SINS_CATEGORIES}`.
public struct SinsAndRightsBundle: Decodable, Hashable, Sendable {
    public var topics: [SinTopic]
    public var categories: [SinCategory]?
}

// MARK: - الطب النبوي (src/lib/prophetic-medicine-seed.ts — PROPHETIC_MEDICINE_ITEMS)

public struct PropheticMedicineItem: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let name: String
    public var arabicName: String?
    public var category: String?
    public var hadith: String?
    public var hadithSource: String?
    public var benefits: [String]?
    public var body: String?
    public var disclaimer: String?
}

// MARK: - الأمر بالمعروف (src/lib/amr-bil-maruf-seed.ts)

public struct AmrEvidence: Decodable, Hashable, Sendable {
    public var type: String?
    public let text: String
    public var source: String?
}

public struct AmrLevel: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public var rank: Int?
    public let title: String
    public var description: String?
    public var conditions: [String]?
    public var evidence: [AmrEvidence]?
    public var notes: String?
    public var whoCanDo: String?

    enum CodingKeys: String, CodingKey {
        case id, rank, title, description, conditions, evidence, notes
        case whoCanDo = "who_can_do"
    }
}

public struct AmrCondition: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var detail: String?
    public var scholarNote: String?

    enum CodingKeys: String, CodingKey {
        case id, title, detail
        case scholarNote = "scholar_note"
    }
}

public struct AmrMatter: Decodable, Hashable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public var explanation: String?
}

/// الشكل المحزوم: `{levels: AMR_BIL_MARUF_LEVELS, conditions: AMR_BIL_MARUF_CONDITIONS, munkaraat: MAJOR_MUNKARAAT, maaruf: MAJOR_MAARUF}`.
public struct AmrBilMarufBundle: Decodable, Hashable, Sendable {
    public var levels: [AmrLevel]
    public var conditions: [AmrCondition]?
    public var munkaraat: [AmrMatter]?
    public var maaruf: [AmrMatter]?
}
