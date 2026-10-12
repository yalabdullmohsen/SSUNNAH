import Foundation

enum PeopleData {
    static let file = ContentSource.bundled(name: "people", subdirectory: "Data/quran")
}

struct QuranOccurrence: Decodable, Sendable, Hashable { let surah: Int; let ayah: Int }

struct QuranPerson: Decodable, Sendable, Hashable, Identifiable {
    let slug: String
    let nameAr: String
    let aliases: [String]
    let category: String
    let definition: String
    let whyMentioned: String
    let lessons: [String]
    let occurrences: [QuranOccurrence]
    var id: String { slug }
}

enum PeopleAdapters {
    static let categoryNames: [(key: String, title: String)] = [
        ("prophet", "الأنبياء"), ("righteous", "الصالحون"), ("companion", "الصحابة"),
        ("king", "الملوك"), ("tyrant", "الطغاة"), ("figure", "شخصيات"), ("other", "آخرون"),
    ]

    /// تجميع بترتيب التصنيفات الثابت؛ الترتيب داخل التصنيف كما في المصدر.
    static func grouped(_ people: [QuranPerson]) -> [(title: String, people: [QuranPerson])] {
        categoryNames.compactMap { c in
            let rows = people.filter { $0.category == c.key }
            return rows.isEmpty ? nil : (c.title, rows)
        }
    }

    static func person(_ people: [QuranPerson], slug: String) -> QuranPerson? { people.first { $0.slug == slug } }

    /// «سورة:آية» مرتّبة بلا تكرار، مجمَّعة بالسورة.
    static func occurrenceText(_ occ: [QuranOccurrence], surahName: (Int) -> String) -> [String] {
        let by = Dictionary(grouping: occ, by: \.surah)
        return by.keys.sorted().map { s in
            let ayahs = by[s]!.map(\.ayah).sorted()
            return "\(surahName(s)): \(ayahs.map(String.init).joined(separator: "، "))"
        }
    }
}
