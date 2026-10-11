import Foundation

/// بيانات تصنيف السور المصدَّرة من chapters.json (ترتيب النزول). اسم السورة وعدد آياتها وصفحتها من فهرس المصحف لا من هنا.
enum QuranData {
    static let metaFile = ContentSource.bundled(name: "surahs-meta", subdirectory: "Data/quran")
}

struct QuranSurahMeta: Decodable, Sendable, Hashable {
    let id: Int
    let revelationOrder: Int
    let place: String
}

/// صف سورة جاهز للعرض: يجمع فهرس المصحف وترتيب النزول.
struct QuranSurahRow: Identifiable, Hashable, Sendable {
    let id: Int
    let name: String
    let ayahs: Int
    let firstPage: Int
    let place: String
    let revelationOrder: Int?

    var placeName: String { place == "makkah" ? "مكية" : "مدنية" }
}
