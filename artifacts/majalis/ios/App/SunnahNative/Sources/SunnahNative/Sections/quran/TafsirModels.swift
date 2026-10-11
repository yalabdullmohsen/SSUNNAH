import Foundation

/// بيانات التفسير المحزومة كما صُدِّرت (export-ios-data.mjs) بلا أي تعديل على النص.
enum TafsirData {
    static let registry = ContentSource.bundled(name: "tafsir-registry", subdirectory: "Data/tafsir")
    static func surah(tafsir: String, surah: Int) -> ContentSource {
        .bundled(name: String(format: "%03d", surah), subdirectory: "Data/tafsir/\(tafsir)")
    }
    static func quran(surah: Int) -> ContentSource {
        .bundled(name: String(format: "surah-%03d", surah), subdirectory: "Data/quran")
    }
    /// التفاسير المحزومة فعلًا في التطبيق.
    static let bundledIds: Set<String> = ["muyassar", "saadi"]
}

struct TafsirRegistry: Decodable, Sendable {
    let tafsirs: [TafsirEntry]
}

struct TafsirSource: Decodable, Sendable, Hashable {
    let name: String
    let url: String?
    let permission: String?
}

/// تفسير واحد: الاسم (الكتاب) والمؤلف والمصدر تُعرض كما وردت في السجل.
struct TafsirEntry: Decodable, Sendable, Hashable, Identifiable {
    let id: String
    let name: String
    let author: String
    let source: TafsirSource?
}

struct TafsirSurahFile: Decodable, Sendable {
    let surah: Int
    let ayahs: [String: String]
}

struct TafsirQuranAyah: Decodable, Sendable {
    let numberInSurah: Int
    let text: String
}

struct TafsirQuranFile: Decodable, Sendable {
    let ayahs: [TafsirQuranAyah]
}

struct TafsirAyahRow: Identifiable, Hashable, Sendable {
    let number: Int
    let ayah: String
    let tafsir: String?
    var id: Int { number }
}
