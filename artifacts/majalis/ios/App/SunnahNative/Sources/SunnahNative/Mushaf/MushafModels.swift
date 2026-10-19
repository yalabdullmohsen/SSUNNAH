import Foundation

/// كلمة في سطر: `c` رمز الجلايف في خط الصفحة (code_v2)، `v` مفتاح الآية «سورة:آية»، `e` علامة نهاية آية.
public struct MushafWord: Codable, Equatable, Sendable {
    public let c: String
    public let v: String
    public let e: Int?
    public var isAyahEnd: Bool { e == 1 }

    public init(c: String, v: String, e: Int? = nil) { self.c = c; self.v = v; self.e = e }
}

/// صف في شبكة الصفحة: ترويسة سورة (h) أو بسملة (b) أو فراغ ترويسة (x) أو سطر آيات (l).
public struct MushafRow: Codable, Equatable, Sendable {
    public let k: String
    public let s: Int?
    public let n: Int?
    public let w: [MushafWord]?

    public init(k: String, s: Int? = nil, n: Int? = nil, w: [MushafWord]? = nil) { self.k = k; self.s = s; self.n = n; self.w = w }
}

public struct MushafPage: Codable, Equatable, Sendable {
    public let page: Int
    public let opening: Bool
    public let rows: [MushafRow]

    public init(page: Int, opening: Bool, rows: [MushafRow]) { self.page = page; self.opening = opening; self.rows = rows }

    /// علامة نهاية الآية لا تبدأ سطرًا في المصحف المطبوع: بيانات المصدر تضع العلامة التي تختم السطر في أول السطر التالي
    /// (573 موضعًا في 362 صفحة، مثل ٢١٢ ص33 و١٢٥ ص19). تُعاد إلى آخر سطر الآيات السابق كما في الطبعة — الكلمات وترتيبها وعدد الأسطر كما هي.
    public func endMarksAttachedToLineEnds() -> MushafPage {
        var rows = self.rows
        var prevLine: Int?
        for i in rows.indices {
            guard rows[i].k == "l", var w = rows[i].w, !w.isEmpty else { continue }
            if let p = prevLine, var pw = rows[p].w {
                var moved = 0
                while moved < w.count, w[moved].isAyahEnd { moved += 1 }
                if moved > 0 {
                    pw.append(contentsOf: w[0..<moved]); w.removeFirst(moved)
                    rows[p] = MushafRow(k: rows[p].k, s: rows[p].s, n: rows[p].n, w: pw)
                    rows[i] = MushafRow(k: rows[i].k, s: rows[i].s, n: rows[i].n, w: w)
                }
            }
            prevLine = (rows[i].w?.isEmpty == false) ? i : prevLine
        }
        return MushafPage(page: page, opening: opening, rows: rows)
    }
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
    /// صفحات TabView الحيّة حول الصفحة الحالية (±2)، تصاعديًا؛ ما بعد ±1 عناصر فارغة تُبقي التقليب متصلًا بلا بناء نصوص.
    public static func pagerWindow(around current: Int) -> ClosedRange<Int> {
        let c = clamp(current)
        return max(1, c - 2)...min(pageCount, c + 2)
    }
    /// هل تُرسم الصفحة `n` فعليًا (الحالية وجارتاها) أم عنصر فارغ.
    public static func rendersPage(_ n: Int, current: Int) -> Bool { abs(n - current) <= 1 }
    /// اسم عائلة خط الصفحة كما في جدول الأسماء (QCF2001…QCF2604).
    public static func fontFamily(page: Int) -> String { String(format: "QCF2%03d", page) }
    /// عائلة خط أسماء السور (QPC/KFGQPC، sura_names.ttf).
    public static let surahNameFontFamily = "sura_names"
    /// رمز اسم السورة في الخط: U+E0xx حيث xx أرقام رقم السورة العشرية مكتوبةً كأرقام سداسية (1→E001، 114→E114).
    public static func surahNameGlyph(_ surah: Int) -> String {
        let n = min(max(surah, 1), 114)
        return String(UnicodeScalar(0xE000 + Int(String(n), radix: 16)!)!)
    }
}
