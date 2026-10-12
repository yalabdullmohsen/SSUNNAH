import Foundation

// نماذج قسم «الدروس والتعلم» كما هي في مصادرها (DATA_CONTRACT.md) — تُقرأ بلا تعديل للنصوص.

// MARK: - الدروس (public/data/lessons/chunk-000.json — شبكة)

public struct LearnLesson: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public var speakerName: String?
    public var category: String?
    public var city: String?
    public var region: String?
    public var governorate: String?
    public var mosque: String?
    public var dayOfWeek: String?
    public var lessonTime: String?
    public var schedule: String?
    public var description: String?
    public var audience: String?
    public var delivery: String?
    public var keywords: [String]?
    public var liveURL: String?
    public var bookURL: String?
    public var mapsURL: String?
    public var startDate: String?
    public var endDate: String?
    public var isRecurring: Bool?
    public var isCourse: Bool?
    public var status: String?

    enum CodingKeys: String, CodingKey {
        case id, title, category, city, region, governorate, mosque, schedule, description, audience, delivery, keywords, status
        case speakerName = "speaker_name"
        case dayOfWeek = "day_of_week"
        case lessonTime = "lesson_time"
        case liveURL = "live_url"
        case bookURL = "book_url"
        case mapsURL = "maps_url"
        case startDate = "start_date"
        case endDate = "end_date"
        case isRecurring = "is_recurring"
        case isCourse = "is_course"
    }

    /// سطر الموعد كما يعرضه الويب: الجدول الصريح، وإلا اليوم + الوقت.
    public var scheduleLine: String? {
        if let schedule, !schedule.isEmpty { return schedule }
        let parts = [dayOfWeek, lessonTime].compactMap { $0 }.filter { !$0.isEmpty }
        return parts.isEmpty ? nil : parts.joined(separator: " — ")
    }

    /// السطر الثانوي في القوائم: الشيخ · الموعد.
    public var listSubtitle: String? {
        let parts = [speakerName, scheduleLine].compactMap { $0 }.filter { !$0.isEmpty }
        return parts.isEmpty ? nil : parts.joined(separator: " · ")
    }

    /// سطر المكان: المسجد ثم المنطقة ثم المدينة.
    public var placeLine: String? {
        let parts = [mosque, region, city].compactMap { $0 }.filter { !$0.isEmpty }
        return parts.isEmpty ? nil : parts.joined(separator: "، ")
    }
}

/// تقسيم الدروس إلى جارية ومؤرشفة — مطابق لـ`isExpired` في src/lib/kuwait-lessons.ts:
/// تاريخ نهاية صريح مضى (نهاية اليوم بتوقيت الكويت)، أو درس غير متكرر مضى تاريخ بدايته.
public enum LearnLessonArchive {
    public static func isArchived(_ lesson: LearnLesson, now: Date = Date()) -> Bool {
        if let end = lesson.endDate.flatMap(endOfDay) { return end < now }
        if lesson.isRecurring == false, let start = lesson.startDate.flatMap(endOfDay) { return start < now }
        return false
    }

    public static func split(_ lessons: [LearnLesson], now: Date = Date()) -> (active: [LearnLesson], archived: [LearnLesson]) {
        let visible = lessons.filter { $0.status == nil || $0.status == "approved" }
        return (visible.filter { !isArchived($0, now: now) }, visible.filter { isArchived($0, now: now) })
    }

    /// `YYYY-MM-DD` → 23:59:59 بتوقيت +03:00.
    static func endOfDay(_ ymd: String) -> Date? {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone(secondsFromGMT: 3 * 3600)
        f.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        return f.date(from: String(ymd.prefix(10)) + "T23:59:59")
    }
}

// MARK: - مشايخ الكويت (src/lib/kuwait-sheikhs.ts → Data/learn/kuwait-sheikhs.json)

public struct LearnKuwaitSheikh: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let name: String
    public var specialty: String?
    public var drosq8Url: String?
    public var twitterHandle: String?
}

// MARK: - الأسئلة (Data/quiz/manifest.json + الأجزاء، المصدَّر الحي فقط)

public struct LearnQuizManifest: Decodable, Sendable {
    public struct Chunk: Decodable, Identifiable, Hashable, Sendable {
        public let file: String
        public let count: Int
        public var id: String { file }
        /// «السيرة_النبوية-012.json» → «السيرة النبوية».
        public var title: String {
            var name = file.hasSuffix(".json") ? String(file.dropLast(5)) : file
            if let dash = name.lastIndex(of: "-"), name[name.index(after: dash)...].allSatisfy(\.isNumber) {
                name = String(name[..<dash])
            }
            return name.replacingOccurrences(of: "_", with: " ")
        }
        /// اسم الملف بلا امتداد كما يطلبه `ContentSource.bundled`.
        public var resourceName: String { file.hasSuffix(".json") ? String(file.dropLast(5)) : file }
    }
    public let total: Int
    public let chunks: [Chunk]
}

/// سؤال مفتوح كما في الملفات (بلا خيارات): سؤال، جواب، شرح، مرجع.
public struct LearnOpenQuestion: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let question: String
    public let answer: String
    public var explanation: String?
    public var reference: String?
    public var category: String?
    public var level: String?
}

// MARK: - المسابقات (src/lib/competitions → Data/learn/competitions.json؛ فارغة في الإنتاج حاليًا)

public struct LearnCompetition: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public var organizerName: String?
    public var description: String?
    public var prizeText: String?
    public var registrationStatus: String?
    public var registrationUrl: String?
    public var location: String?
    public var genderTarget: String?
    public var sourceName: String?
    public var sourceUrl: String?
    public var tags: [String]?
}

// MARK: - الجامعات (src/data/universities-catalog.json → Data/learn/universities.json)

public struct LearnUniversity: Decodable, Identifiable, Hashable, Sendable {
    public struct Program: Decodable, Hashable, Sendable {
        public var programName: String?
        public var facultyDepartment: String?
        public var specialization: String?
        public var degreeLevel: String?
        public var studyLanguage: String?
        public var studyMode: String?
        public var duration: String?
        public var hasScholarship: Bool?
        public var scholarshipDetails: String?

        enum CodingKeys: String, CodingKey {
            case specialization, duration
            case programName = "program_name"
            case facultyDepartment = "faculty_department"
            case degreeLevel = "degree_level"
            case studyLanguage = "study_language"
            case studyMode = "study_mode"
            case hasScholarship = "has_scholarship"
            case scholarshipDetails = "scholarship_details"
        }
    }

    public struct Faq: Decodable, Hashable, Sendable {
        public let question: String
        public let answer: String
    }

    public let slug: String
    public let nameAr: String
    public var nameEn: String?
    public var country: String?
    public var city: String?
    public var about: String?
    public var websiteURL: String?
    public var accreditationStatus: String?
    public var isVerified: Bool?
    public var programs: [Program]?
    public var faqs: [Faq]?
    public var lastUpdatedAt: String?

    public var id: String { slug }

    enum CodingKeys: String, CodingKey {
        case slug, country, city, about, programs, faqs
        case nameAr = "name_ar"
        case nameEn = "name_en"
        case websiteURL = "website_url"
        case accreditationStatus = "accreditation_status"
        case isVerified = "is_verified"
        case lastUpdatedAt = "last_updated_at"
    }

    /// تسميات `ACCREDITATION_LABELS` في src/lib/universities-service.ts.
    public var accreditationLabel: String {
        switch accreditationStatus {
        case "accredited": return "موثّقة في الدليل"
        case "provisional": return "قيد التحقق"
        case "unverified": return "غير متحقق"
        default: return "غير محدد"
        }
    }

    public var degreeLevels: [String] {
        var seen: [String] = []
        for p in programs ?? [] { if let d = p.degreeLevel, !d.isEmpty, !seen.contains(d) { seen.append(d) } }
        return seen
    }

    public var offersScholarship: Bool { (programs ?? []).contains { $0.hasScholarship == true } }
}

/// اختيار الجامعات للمقارنة؛ الحد مطابق لـ`MAX_COMPARE` في الويب.
public struct LearnCompareSelection: Equatable, Sendable {
    public static let maxCount = 4
    public private(set) var slugs: [String] = []
    public init(slugs: [String] = []) { self.slugs = Array(slugs.prefix(Self.maxCount)) }

    public var canAdd: Bool { slugs.count < Self.maxCount }
    public func contains(_ slug: String) -> Bool { slugs.contains(slug) }

    /// يضيف أو يزيل؛ لا يتجاوز الحد.
    public mutating func toggle(_ slug: String) {
        if let i = slugs.firstIndex(of: slug) { slugs.remove(at: i) } else if canAdd { slugs.append(slug) }
    }
}

// MARK: - المؤسسات (src/data/institutions-catalog.json → Data/learn/institutions.json)

public struct LearnInstitution: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let name: String
    public var type: String?
    public var city: String?
    public var country: String?
    public var description: String?
    public var website: String?
    public var sourceUrl: String?
    public var contentStatus: String?

    /// قرار المالك (2026-10-12، docs/native/LEARN_INSTITUTIONS_DECISION.md): لا يُعرض إلا المراجَع؛ `needs_review` أو بلا حالة يُخفى.
    public var isReviewed: Bool { ["verified", "approved", "reviewed"].contains(contentStatus ?? "") }

    /// تسميات InstitutionDiscoverCard في الويب.
    public var typeLabel: String? {
        switch type {
        case "mosque": return "مسجد"
        case "center": return "مركز"
        case "university": return "جامعة"
        case "library": return "مكتبة"
        default: return nil
        }
    }
}

// MARK: - الرسم المعرفي (public/data/graph/links.json → Data/graph/links.json)

public struct LearnKnowledgeGraph: Decodable, Sendable {
    public struct NodeRef: Decodable, Hashable, Sendable {
        public let kind: String
        public let slug: String
        public var key: String { kind + ":" + slug }
    }

    public struct Node: Decodable, Identifiable, Hashable, Sendable {
        public let kind: String
        public let slug: String
        public let titleAr: String
        public var id: String { kind + ":" + slug }
    }

    public struct Link: Decodable, Hashable, Sendable {
        public let from: NodeRef
        public let rel: String
        public let to: NodeRef
        public var labelAr: String?
    }

    public struct Relation: Identifiable, Hashable, Sendable {
        public let label: String
        public let node: Node
        public var id: String { label + "|" + node.id }
    }

    public let nodes: [Node]
    public let links: [Link]

    public func node(_ ref: NodeRef) -> Node? { nodes.first { $0.kind == ref.kind && $0.slug == ref.slug } }

    /// علاقات العقدة الصادرة (بتسميتها) والواردة (باسم العلاقة كما هي).
    public func relations(of node: Node) -> [Relation] {
        var out: [Relation] = []
        for l in links {
            if l.from.key == node.id, let target = self.node(l.to) { out.append(Relation(label: l.labelAr ?? l.rel, node: target)) }
            if l.to.key == node.id, let source = self.node(l.from) { out.append(Relation(label: l.labelAr ?? l.rel, node: source)) }
        }
        return out
    }

    public struct KindGroup: Identifiable, Sendable {
        public let kind: String
        public let nodes: [Node]
        public var id: String { kind }
    }

    /// العقد مجمّعة حسب النوع بترتيب ظهور النوع الأول.
    public var groups: [KindGroup] {
        var order: [String] = []
        var byKind: [String: [Node]] = [:]
        for n in nodes {
            if byKind[n.kind] == nil { order.append(n.kind) }
            byKind[n.kind, default: []].append(n)
        }
        return order.map { KindGroup(kind: $0, nodes: byKind[$0] ?? []) }
    }

    public static func kindLabel(_ kind: String) -> String {
        switch kind {
        case "scholar": return "العلماء"
        case "book": return "الكتب"
        case "surah": return "السور"
        case "hadith": return "الأحاديث"
        case "ruling": return "الأحكام"
        case "term": return "المصطلحات"
        case "dua": return "الأدعية"
        case "prophet": return "الأنبياء"
        case "story": return "القصص"
        default: return kind
        }
    }
}

// MARK: - طبقة المعرفة (public/data/knowledge — شبكة؛ المعتمد `verified` فقط)

public struct LearnKnowledgeItem: Decodable, Identifiable, Hashable, Sendable {
    public struct Evidence: Decodable, Hashable, Sendable {
        public var type: String?
        public var ref: String?
        public var text: String?
        public var grade: String?
        public var gradedBy: String?
        enum CodingKeys: String, CodingKey { case type, ref, text, grade, gradedBy = "graded_by" }
    }

    public struct Source: Decodable, Hashable, Sendable {
        public var book: String?
        public var author: String?
        public var locator: String?
    }

    public let id: String
    public let title: String
    public var summary: String?
    public var body: String
    public var evidences: [Evidence]
    public var sources: [Source]
    public var tags: [String]
    public var reviewStatus: String?
    public var section: String?

    enum CodingKeys: String, CodingKey {
        case id, title, summary, body, evidences, sources, tags, section
        case reviewStatus = "review_status"
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        title = try c.decode(String.self, forKey: .title)
        summary = try c.decodeIfPresent(String.self, forKey: .summary)
        body = try c.decodeIfPresent(String.self, forKey: .body) ?? ""
        evidences = (try? c.decodeIfPresent([Evidence].self, forKey: .evidences)) ?? []
        sources = (try? c.decodeIfPresent([Source].self, forKey: .sources)) ?? []
        tags = (try? c.decodeIfPresent([String].self, forKey: .tags)) ?? []
        reviewStatus = try c.decodeIfPresent(String.self, forKey: .reviewStatus)
        section = try c.decodeIfPresent(String.self, forKey: .section)
    }

    public var isVerified: Bool { reviewStatus == "verified" }
}

/// ملف معرفة بأحد الأشكال الثلاثة التي يقبلها `unwrap` في knowledge-loader.ts: مصفوفة، أو `{items}`، أو عنصر مفرد.
public struct LearnKnowledgeFile: Decodable, Sendable {
    public let items: [LearnKnowledgeItem]
    private enum Keys: String, CodingKey { case items }

    public init(from decoder: Decoder) throws {
        if let list = try? [LearnKnowledgeItem](from: decoder) { items = list; return }
        let c = try decoder.container(keyedBy: Keys.self)
        if let list = try c.decodeIfPresent([LearnKnowledgeItem].self, forKey: .items) { items = list; return }
        items = [try LearnKnowledgeItem(from: decoder)]
    }
}

/// ملفات كل قسم معرفة — منقولة من `loadSectionItems` في src/lib/knowledge-loader.ts.
public enum LearnKnowledgeSections {
    public static let titles: [String: String] = [
        "prophets": "قصص الأنبياء",
        "nations": "الأمم السابقة",
        "quiz": "تحدي الأسئلة",
        "quran-people": "المذكورون في القرآن الكريم",
        "tafsir": "التفسير",
        "history": "التاريخ الإسلامي",
        "intro-islam": "التعريف بالإسلام",
        "discover-islam": "اكتشف الإسلام",
    ]

    static let prophetSlugs = [
        "adam", "idris", "nuh", "hud", "salih", "ibrahim", "lut", "ismail", "is-haq", "yaqub", "yusuf", "ayyub", "shuayb",
        "musa", "harun", "dhul-kifl", "dawud", "sulayman", "ilyas", "al-yasa", "yunus", "zakariyya", "yahya",
    ]

    static let nationIds = [
        "nation-qawm-nuh", "nation-aad", "nation-thamud", "nation-qawm-lut", "nation-madyan", "nation-firaun",
        "nation-bani-israil", "nation-ashab-sabt", "nation-ashab-kahf", "nation-ashab-ukhdud", "nation-saba",
    ]

    /// المسارات النسبية تحت `data/knowledge/`، أو nil لقسم غير معروف.
    public static func files(for section: String) -> [String]? {
        let pad = { (n: Int, w: Int) in String(repeating: "0", count: max(0, w - String(n).count)) + String(n) }
        switch section {
        case "prophets": return prophetSlugs.map { "prophets/\($0).json" }
        case "nations": return nationIds.map { "nations/\($0).json" }
        case "quiz": return (1...8).map { "quiz/batch-\(pad($0, 3)).json" }
        case "tafsir":
            var out = ["tafsir/surahs/all-surah-intros.json", "tafsir/ayahs/juz-amma-and-fatiha.json"]
            for surah in [2, 3] { for b in 1...8 { out.append("tafsir/ayahs/surah-\(pad(surah, 3))-batch-\(pad(b, 2)).json") } }
            return out
        case "quran-people": return ["quran-people/people.json"]
        case "history": return ["history/timeline.json"]
        case "intro-islam": return ["intro-islam/topics.json"]
        case "discover-islam": return ["discover-islam/path-and-faq.json"]
        default: return nil
        }
    }
}

// MARK: - الدروس الإيمانية والمتنوعة (src/lib/durus-*-data.ts → Data/learn/durus-*.json)

public struct LearnDarsSection: Decodable, Identifiable, Hashable, Sendable {
    public struct Item: Decodable, Identifiable, Hashable, Sendable {
        public let id: String
        public let title: String
        public var summary: String?
        public var body: String?
    }
    public let id: String
    public var num: String?
    public let title: String
    public let lessons: [Item]
}
