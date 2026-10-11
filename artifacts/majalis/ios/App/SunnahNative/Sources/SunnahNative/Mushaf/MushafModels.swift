import Foundation

/// كلمة في سطر: `c` رمز الجلايف في خط الصفحة (code_v2)، `v` مفتاح الآية «سورة:آية»، `e` علامة نهاية آية.
public struct MushafWord: Codable, Equatable, Sendable {
    public let c: String
    public let v: String
    public let e: Int?
    public var isAyahEnd: Bool { e == 1 }
}

/// صف في شبكة الصفحة: ترويسة سورة (h) أو بسملة (b) أو فراغ ترويسة (x) أو سطر آيات (l).
public struct MushafRow: Codable, Equatable, Sendable {
    public let k: String
    public let s: Int?
    public let n: Int?
    public let w: [MushafWord]?
}

public struct MushafPage: Codable, Equatable, Sendable {
    public let page: Int
    public let opening: Bool
    public let rows: [MushafRow]
}

public struct MushafSurah: Codable, Equatable, Sendable, Identifiable {
    public let id: Int
    public let name: String
    public let ayahs: Int
    public let firstPage: Int
    public let lastPage: Int
    public let place: String
    public let bismillahPre: Bool
}

public struct MushafIndex: Codable, Equatable, Sendable {
    public let surahs: [MushafSurah]
    public let juzStart: [Int]
    public let ayahPage: [String: Int]

    public func surah(onPage page: Int) -> MushafSurah? {
        surahs.last { $0.firstPage <= page }
    }
    public func juz(onPage page: Int) -> Int {
        (juzStart.lastIndex { $0 <= page } ?? 0) + 1
    }
}

public enum Mushaf {
    public static let pageCount = 604
    public static func clamp(_ page: Int) -> Int { min(max(page, 1), pageCount) }
    /// اسم عائلة خط الصفحة كما في جدول الأسماء (QCF2001…QCF2604).
    public static func fontFamily(page: Int) -> String { String(format: "QCF2%03d", page) }
}
