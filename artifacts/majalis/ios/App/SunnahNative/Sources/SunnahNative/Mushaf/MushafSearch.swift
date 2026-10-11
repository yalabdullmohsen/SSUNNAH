import Foundation

public struct MushafSearchHit: Equatable, Sendable, Identifiable {
    public var id: String { ayah }
    public let ayah: String
    public let page: Int
    public let text: String
}

/// بحث في نص Tanzil الحرفي بعد التطبيع المشترك (إزالة التشكيل وتوحيد الألف)؛ النص المعروض لا يُعدَّل.
public struct MushafSearch: Sendable {
    private struct Entry: Sendable { let ayah: String; let text: String; let norm: String }
    private let entries: [Entry]
    private let ayahPage: [String: Int]

    private struct SurahFile: Decodable { struct A: Decodable { let numberInSurah: Int; let text: String }; let number: Int; let ayahs: [A] }

    public init(surahDirectory: URL, ayahPage: [String: Int]) throws {
        var out: [Entry] = []
        for s in 1...114 {
            let d = try Data(contentsOf: surahDirectory.appendingPathComponent(String(format: "surah-%03d.json", s)))
            let f = try JSONDecoder().decode(SurahFile.self, from: d)
            for a in f.ayahs {
                let t = a.text.replacingOccurrences(of: "\u{FEFF}", with: "")
                out.append(.init(ayah: "\(f.number):\(a.numberInSurah)", text: t, norm: Self.normalize(t)))
            }
        }
        entries = out; self.ayahPage = ayahPage
    }

    static func normalize(_ text: String) -> String {
        text.split(whereSeparator: \.isWhitespace).map { QuranWordMatch.normalizeQuranWord(String($0)) }.filter { !$0.isEmpty }.joined(separator: " ")
    }

    public func search(_ query: String, limit: Int = 50) -> [MushafSearchHit] {
        let q = Self.normalize(query)
        guard q.count >= 2 else { return [] }
        return entries.lazy.filter { $0.norm.contains(q) }.prefix(limit).map {
            MushafSearchHit(ayah: $0.ayah, page: ayahPage[$0.ayah] ?? 1, text: $0.text)
        }
    }
}
