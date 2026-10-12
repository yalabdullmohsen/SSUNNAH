import Foundation

/// نماذج المصادر المنشورة (تجويد، قصص السور، مسارات الحفظ، إحصاءات، قراءات، أحرف) — تصديرها: scripts/native/sections/quran-ts.mjs
enum PublishedData {
    static func file(_ name: String) -> ContentSource { .bundled(name: name, subdirectory: "Data/quran") }
}

struct TajweedExample: Decodable, Sendable, Hashable { let text: String; let note: String?; let surah: Int; let ayah: Int }
struct TajweedChapter: Decodable, Sendable, Hashable, Identifiable {
    let id: String; let order: Int; let title: String; let summary: String
    let body: [String]; let source: String; let quizHint: String?; let examples: [TajweedExample]
}
struct TajweedIntro: Decodable, Sendable, Hashable { let title: String; let paragraphs: [String]; let source: String }
struct TajweedFile: Decodable, Sendable { let intro: TajweedIntro?; let chapters: [TajweedChapter] }

struct SurahStory: Decodable, Sendable, Hashable, Identifiable {
    let number: Int; let name: String; let namingReason: String?; let revelationPlace: String; let ayahCount: Int
    let mainThemes: [String]; let mainStories: [String]; let lessons: [String]; let virtues: String?
    let source: String; let lastReviewed: String
    var id: Int { number }
}

struct HifzRef: Decodable, Sendable, Hashable { let surah: Int; let ayahFrom: Int; let ayahTo: Int }
struct HifzUnit: Decodable, Sendable, Hashable, Identifiable {
    let id: String; let title: String; let sequence: Int; let ref: HifzRef?
    let completionCriteria: String?; let repetitionTarget: Int?
}
struct HifzPath: Decodable, Sendable, Hashable, Identifiable {
    let id: String; let slug: String; let title: String; let shortDescription: String?
    let category: String; let level: String; let source: String?; let learningObjectives: [String]; let units: [HifzUnit]
}

struct StatSource: Decodable, Sendable, Hashable { let book: String; let author: String; let ref: String }
struct StatVariant: Decodable, Sendable, Hashable { let value: String; let attribution: String; let source: String }
struct QuranStat: Decodable, Sendable, Hashable, Identifiable {
    let id: String; let label: String; let value: String; let note: String?; let kind: String; let group: String
    let method: String?; let detail: String?; let source: StatSource; let variants: [StatVariant]
}

struct QiraatSection: Decodable, Sendable, Hashable, Identifiable { let id: String; let title: String; let body: [String]; let source: String }
struct QiraatQari: Decodable, Sendable, Hashable, Identifiable {
    let id: String; let name: String; let nisba: String; let deathYearHijri: String?; let bio: String; let rawis: [String]; let source: String
}
struct QiraatDiff: Decodable, Sendable, Hashable, Identifiable { let id: String; let kind: String; let description: String; let surah: Int; let ayah: Int; let source: String }
struct QiraatFile: Decodable, Sendable { let sections: [QiraatSection]; let ashara: [QiraatQari]; let diffs: [QiraatDiff] }

struct MiracleItem: Decodable, Sendable, Hashable, Identifiable {
    let id: String; let title: String; let category: String; let reference: String
    let body: String; let scholarlySource: String
}
struct AhrufSection: Decodable, Sendable, Hashable, Identifiable { let id: String; let title: String; let body: [String]; let sources: [String] }

enum PublishedAdapters {
    static let statGroups: [(key: String, title: String)] = [
        ("bunya", "البنية"), ("alfaz", "الألفاظ"), ("mawdoo", "الموضوعات"), ("suwar", "السور"), ("ajaib", "العجائب"),
    ]
    static let statKinds = ["agreed": "متفق عليه", "by-school": "بحسب المدارس", "disputed": "مختلف فيه"]
    static let hifzCategories = [
        "quran": "القرآن", "jawami-hadith": "جوامع الحديث", "adhkar": "الأذكار", "aqidah": "العقيدة",
        "fiqh": "الفقه", "hadith-mutun": "متون الحديث", "arabic": "العربية", "talib-ilm": "طالب العلم",
    ]
    static let hifzLevels = ["beginner": "مبتدئ", "intermediate": "متوسط", "advanced": "متقدم"]
    static let diffKinds = ["lahji": "لحني", "harakah": "حركة", "harf": "حرف"]

    static func statsByGroup(_ s: [QuranStat]) -> [(title: String, stats: [QuranStat])] {
        statGroups.compactMap { g in
            let rows = s.filter { $0.group == g.key }
            return rows.isEmpty ? nil : (g.title, rows)
        }
    }

    static func hifzByCategory(_ p: [HifzPath]) -> [(title: String, paths: [HifzPath])] {
        let keys = p.map(\.category).reduce(into: [String]()) { if !$0.contains($1) { $0.append($1) } }
        return keys.map { k in (hifzCategories[k] ?? k, p.filter { $0.category == k }) }
    }

    static func refText(_ r: HifzRef, surahName: (Int) -> String) -> String {
        r.ayahFrom == r.ayahTo ? "\(surahName(r.surah)): \(r.ayahFrom)" : "\(surahName(r.surah)): \(r.ayahFrom)–\(r.ayahTo)"
    }

    static func ayahText(surah: Int, ayah: Int, surahName: (Int) -> String) -> String { "\(surahName(surah)): \(ayah)" }
}
