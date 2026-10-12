import Foundation

/// نماذج قسم «اللغة والمكتبة والبحث» كما تُصدَّر من مصادر الويب حرفيًا.
/// الملفات المطلوبة من التصدير في docs/native/requests/library.md؛ المحزوم تحت `Data/library/`.
enum LibraryData {
    static let directory = "Data/library"
    static func file(_ name: String) -> ContentSource { .bundled(name: name, subdirectory: directory) }
}

/// يقبل معرّفًا نصيًا أو رقميًا.
struct LibraryFlexibleID: Decodable, Sendable, Hashable {
    let value: String
    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if let n = try? c.decode(Int.self) { value = String(n) } else { value = try c.decode(String.self) }
    }
}

/// بحث علمي (src/lib/researches/types.ts ResearchRecord) — الحقول المعروضة فقط.
struct LibraryResearch: Decodable, Sendable, Hashable {
    let id: String
    let slug: String
    let title: String
    var kind: String?
    var categoryIds: [String]
    var authors: [Author]
    var supervisor: String?
    var university: String?
    var college: String?
    var country: String?
    var year: Int?
    var abstract: String
    var keywords: [String]
    var referencesNote: String?
    var sourceUrl: String?
    var doi: String?
    var publisher: String?
    var reviewStatus: String
    var license: String?
    var accessType: String?
    var copyrightNote: String?
    var isDemo: Bool?

    struct Author: Decodable, Sendable, Hashable {
        let name: String
        var role: String?
    }
}

/// تصنيف الأبحاث (src/lib/researches/catalog.ts RESEARCH_CATEGORIES).
struct LibraryResearchCategory: Decodable, Sendable, Hashable {
    let id: String
    let label: String
    var sortOrder: Int?
}

/// ملف الأبحاث المُصدَّر: المنشور والتصنيفات معًا (المساعد يحتاجهما).
struct LibraryResearchFile: Decodable, Sendable, Hashable {
    var records: [LibraryResearch]
    var categories: [LibraryResearchCategory]
}

/// قسم دروس (src/lib/dars-types.ts): arabic-language وmawsuaat.
struct LibraryDarsSection: Decodable, Sendable, Hashable {
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

/// مصطلح (IslamicGlossaryView.tsx GlossaryTerm).
struct LibraryGlossaryTerm: Decodable, Sendable, Hashable {
    let id: LibraryFlexibleID
    let term: String
    var plural: String?
    var category: String?
    var definition: String
    var detail: String?
    var related: [String]?
    var source: String?
}

/// خريطة ذهنية (src/lib/mind-maps-data.ts).
struct LibraryMindMap: Decodable, Sendable, Hashable {
    let id: String
    let title: String
    var category: String?
    var description: String?
    var root: Node

    struct Node: Decodable, Sendable, Hashable {
        let id: String
        let label: String
        var children: [Node]?
        var href: String?
    }
}

/// إعلان علمي (src/lib/scientific-announcements-seed.ts).
struct LibraryAnnouncement: Decodable, Sendable, Hashable {
    let id: String
    let announcementTitle: String
    var lessonTitle: String?
    var sheikh: String?
    var bookTitle: String?
    var bookAuthor: String?
    var organizer: String?
    var day: String?
    var date: String?
    var time: String?
    var mosque: String?
    var venue: String?
    var region: String?
    var governorate: String?
    var registrationUrl: String?
    var liveUrl: String?
    var websiteUrl: String?
    var notes: [String]?
    var tags: [String]?
}

/// حساب مصدر (public/data/sources/accounts.json).
struct LibrarySourceAccount: Decodable, Sendable, Hashable {
    let id: String
    var platform: String?
    var handle: String?
    var url: String?
    let nameAr: String
    var kind: String?
    var topics: [String]?
    var regionAr: String?
    var enabled: Bool?

    enum CodingKeys: String, CodingKey {
        case id, platform, handle, url, kind, topics, enabled
        case nameAr = "name_ar", regionAr = "region_ar"
    }
}

struct LibrarySourceAccountsFile: Decodable, Sendable, Hashable {
    var accounts: [LibrarySourceAccount]
}

/// بطاقة من آخر ما نُشر (public/data/lessons/feed.json).
struct LibraryFeedItem: Decodable, Sendable, Hashable {
    let id: String
    let titleAr: String
    var summaryAr: String?
    var sheikh: String?
    var place: String?
    var timeText: String?
    var sources: [Source]?

    struct Source: Decodable, Sendable, Hashable { let id: String }

    enum CodingKeys: String, CodingKey {
        case id, sheikh, place, sources
        case titleAr = "title_ar", summaryAr = "summary_ar", timeText = "time_text"
    }
}

struct LibraryFeedFile: Decodable, Sendable, Hashable {
    var items: [LibraryFeedItem]
}

/// وثيقة نصية تُنقل حرفيًا (الشروط، المنهجية): أقسام بعناوين وفقرات.
struct LibraryTextDocument: Decodable, Sendable, Hashable {
    let title: String
    var updatedAt: String?
    var sections: [Section]

    struct Section: Decodable, Sendable, Hashable {
        let title: String
        var paragraphs: [String]
    }
}

/// التنقل المُصدَّر من src/config/sections.registry.ts وSiteMapView وMorePage.
struct LibraryNavigation: Decodable, Sendable, Hashable {
    var groups: [Group]
    var sections: [Section]
    var settingsRows: [Row]
    var sitemap: [SitemapGroup]

    struct Group: Decodable, Sendable, Hashable {
        let id: String
        let title: String
        var subtitle: String?
        var sections: [Section]
    }

    struct Section: Decodable, Sendable, Hashable {
        let id: String
        let title: String
        var subtitle: String?
        let route: String
    }

    struct Row: Decodable, Sendable, Hashable {
        let id: String
        let title: String
        var description: String?
        let href: String
    }

    struct SitemapGroup: Decodable, Sendable, Hashable {
        let title: String
        var links: [Link]

        struct Link: Decodable, Sendable, Hashable {
            let href: String
            let label: String
            var desc: String?
        }
    }
}

/// فهرس البحث (public/data/search/index.json) بعد استبعاد الممنوع في التصدير.
struct LibrarySearchIndex: Decodable, Sendable, Hashable {
    var docs: [Doc]

    struct Doc: Decodable, Sendable, Hashable {
        let id: String
        let kind: String
        let titleAr: String
        let href: String
        var norm: String?
    }
}
