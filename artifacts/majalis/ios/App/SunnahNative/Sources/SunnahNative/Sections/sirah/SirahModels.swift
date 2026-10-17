import Foundation

/// نماذج قسم «السيرة والتاريخ والأعلام» كما تُصدَّر من مصادر الويب حرفيًا (لا إعادة تصميم).
/// المسارات المطلوبة من التصدير في docs/native/requests/sirah.md؛ كلها تحت `Data/sirah/`.
enum SirahData {
    static let directory = "Data/sirah"
    static func file(_ name: String) -> ContentSource { .bundled(name: name, subdirectory: directory) }
}

/// قسم دروس (src/lib/dars-types.ts): fikr-waqia.
struct SirahDarsSection: Decodable, Sendable, Hashable {
    let id: String
    var num: String?
    let title: String
    var lessons: [Lesson]

    struct Lesson: Decodable, Sendable, Hashable {
        let id: String
        let title: String
        var summary: String?
        var body: String?
    }
}

/// ملف fikr-waqia: الشكل الخام `[قسم{lessons}]` أو ContentItem مسطّح يُجمَّع بحسب `tags[0]`.
struct SirahDarsFile: Decodable, Sendable {
    let sections: [SirahDarsSection]
    init(from decoder: Decoder) throws {
        if let raw = try? [SirahDarsSection](from: decoder) { sections = raw; return }
        let flat = try [ContentItem](from: decoder)
        var order: [String] = []; var groups: [String: [SirahDarsSection.Lesson]] = [:]
        for it in flat {
            let key = it.tags.first ?? "فكر وواقع"
            if groups[key] == nil { order.append(key) }
            let body = it.body.flatMap { b in (it.subtitle.map { b.contains($0) } ?? false) ? nil : b }
            groups[key, default: []].append(.init(id: it.id, title: it.title, summary: it.subtitle, body: body))
        }
        sections = order.map { SirahDarsSection(id: $0, num: nil, title: $0, lessons: groups[$0] ?? []) }
    }
}

/// معلم (src/lib/islamic-landmarks-data.ts IslamicLandmark).
struct SirahLandmark: Decodable, Sendable, Hashable {
    let id: String
    let name: String
    var country: String
    var city: String
    var type: String
    var era: String?
    var builtYear: String?
    var description: String
    var significance: String
    var capacity: String?
    var area: String?
    var tags: [String]?
}

/// دليل نصي (src/lib/nations/types.ts Evidence).
struct SirahEvidence: Decodable, Sendable, Hashable {
    let kind: String
    let text: String
    let ref: String
    var grade: String?
}

/// أمة (src/lib/nations/types.ts Nation) — الحقول المعروضة فقط.
struct SirahNation: Decodable, Sendable, Hashable {
    let slug: String
    let name: String
    var place: String
    var era: String
    var eraOrder: Int?
    var summary: String
    var chapters: [Chapter]
    var quranRefs: [QuranRef]
    var hadiths: [SirahEvidence]
    var lessons: [String]
    var tags: [String]?

    struct Chapter: Decodable, Sendable, Hashable {
        let id: String
        let title: String
        var body: [String]
        var evidences: [SirahEvidence]?
        var notKnown: String?
    }

    struct QuranRef: Decodable, Sendable, Hashable {
        let surah: String
        let ayahs: String
        var note: String?
    }
}

/// مناسبة مُصدَّقة (src/lib/religious-content/verified-calendar.ts VerifiedReligiousRecord).
struct SirahOccasion: Decodable, Sendable, Hashable {
    let id: String
    let eventName: String
    var hijriMonth: Int?
    var hijriDay: Int?
    var verifiedDescription: String
    var recommendedActions: [String]?
    var evidence: String?
    var sourceName: String?
    var sourceUrl: String?
    var caveat: String?
    var reviewStatus: String
}

/// عنصر معرفة (src/lib/knowledge-loader.ts KnowledgeItem): قصص الأنبياء من knowledge/prophets.
struct SirahKnowledgeItem: Decodable, Sendable, Hashable {
    let id: String
    let title: String
    let body: String
    var evidences: [Evidence]?
    var sources: [Source]?
    var tags: [String]?
    let reviewStatus: String
    /// أقسام موثّقة مفصولة (identity / saadi / sunnah) لكلٍّ مصدره؛ اختيارية للتوافق مع البيانات القديمة.
    var sections: [Part]?

    struct Part: Decodable, Sendable, Hashable {
        let key: String
        let title: String
        let body: String
        var sources: [Source]?
    }

    struct Evidence: Decodable, Sendable, Hashable {
        var type: String?
        var ref: String?
        let text: String
        var grade: String?
        var gradedBy: String?
        enum CodingKeys: String, CodingKey { case type, ref, text, grade, gradedBy = "graded_by" }
    }

    struct Source: Decodable, Sendable, Hashable {
        let book: String
        var author: String?
        var locator: String?
    }

    enum CodingKeys: String, CodingKey { case id, title, body, evidences, sources, tags, sections, reviewStatus = "review_status" }
}

/// عقدة شجرة الأنبياء (src/lib/prophets-lineage.ts LineageNode).
struct SirahLineageNode: Decodable, Sendable, Hashable {
    let id: String
    let name: String
    var isAncestor: Bool?
    var era: String?
    var people: String?
    var linkNote: String?
    var generationsGap: Int?
    var isUlulAzm: Bool?
    var children: [SirahLineageNode]?
}

/// صحابي (SahabahPage.tsx Sahabi). `quote` لا يُعرض: نص منسوب بلا مصدر.
struct SirahSahabi: Decodable, Sendable, Hashable {
    let id: String
    let name: String
    var kunya: String?
    var category: [String]?
    var born: String?
    var died: String?
    var origin: String?
    var islam: String?
    var fadl: String?
    var legacy: [String]?
}

/// مرحلة السيرة (SeerahPage.tsx PHASES).
struct SirahSeerahPhase: Decodable, Sendable, Hashable {
    let id: String
    var num: Int?
    let title: String
    var year: String?
    var desc: String?
    var topics: [String]?
    var keyEvents: [String]?
}

/// باب من الشمائل (ShimaelPage.tsx ShamilBab/MahabbahBab بعد التصدير): `tab` يميّز التبويب.
struct SirahShamailBab: Decodable, Sendable, Hashable {
    let id: String
    let tab: String
    let title: String
    var hadiths: [Hadith]

    struct Hadith: Decodable, Sendable, Hashable {
        let text: String
        var rawi: String?
        var source: String?
        var grade: String?
    }
}

/// قصة (islamic_stories / public/data/stories).
struct SirahStory: Decodable, Sendable, Hashable {
    let id: String
    let slug: String?
    let title: String
    var category: String?
    var era: String?
    var summary: String?
    var fullContent: String?
    var keyLessons: [String]?
    var sources: [String]?
    var tags: [String]?
    var isApproved: Bool
    var editorialReviewStatus: String?

    enum CodingKeys: String, CodingKey {
        case id, slug, title, category, era, summary, sources, tags
        case fullContent = "full_content", keyLessons = "key_lessons", isApproved = "is_approved"
        case editorialReviewStatus = "editorial_review_status"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        if let n = try? c.decode(Int.self, forKey: .id) { id = String(n) } else { id = try c.decode(String.self, forKey: .id) }
        slug = try c.decodeIfPresent(String.self, forKey: .slug)
        title = try c.decode(String.self, forKey: .title)
        category = try c.decodeIfPresent(String.self, forKey: .category)
        era = try c.decodeIfPresent(String.self, forKey: .era)
        summary = try c.decodeIfPresent(String.self, forKey: .summary)
        fullContent = try c.decodeIfPresent(String.self, forKey: .fullContent)
        keyLessons = try? c.decodeIfPresent([String].self, forKey: .keyLessons)
        sources = try? c.decodeIfPresent([String].self, forKey: .sources)
        tags = try? c.decodeIfPresent([String].self, forKey: .tags)
        isApproved = try c.decodeIfPresent(Bool.self, forKey: .isApproved) ?? false
        editorialReviewStatus = try c.decodeIfPresent(String.self, forKey: .editorialReviewStatus)
    }
}

/// حدث تاريخي (src/data/islamic-history/types.ts IslamicHistoryItem).
struct SirahHistoryItem: Decodable, Sendable, Hashable {
    let id: String
    let title: String
    var kind: String?
    var category: String?
    var era: String?
    var hijriDate: String?
    var gregorianDate: String?
    var place: String?
    var relatedPersons: [String]?
    var summary: String
    var detail: String
    var causes: String?
    var outcomes: String?
    var lessons: String?
    var sources: [String]
    var verification: String
    var timelineOrder: Double?
}

/// صف درس (DATA_CONTRACT §2 الدروس) — الحقول اللازمة لبناء فهرس المشايخ.
struct SirahLessonRow: Decodable, Sendable, Hashable {
    let id: String
    let title: String
    var speakerName: String?
    var mosque: String?
    var city: String?
    var schedule: String?
    var lessonTime: String?
    var status: String?

    enum CodingKeys: String, CodingKey {
        case id, title, mosque, city, schedule, status
        case speakerName = "speaker_name", lessonTime = "lesson_time"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        if let n = try? c.decode(Int.self, forKey: .id) { id = String(n) } else { id = try c.decode(String.self, forKey: .id) }
        title = try c.decodeIfPresent(String.self, forKey: .title) ?? ""
        speakerName = try c.decodeIfPresent(String.self, forKey: .speakerName)
        mosque = try c.decodeIfPresent(String.self, forKey: .mosque)
        city = try c.decodeIfPresent(String.self, forKey: .city)
        schedule = try c.decodeIfPresent(String.self, forKey: .schedule)
        lessonTime = try c.decodeIfPresent(String.self, forKey: .lessonTime)
        status = try c.decodeIfPresent(String.self, forKey: .status)
    }
}
