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
    /// النصوص المطبَّعة متجاورة بـUTF-8 تفصل بينها «\n»؛ البحث بايتي (UTF-8 ذاتي التزامن فالتطابق البايتي = تطابق سكالارات).
    private let haystack: [UInt8]
    private let starts: [Int]
    private let ayahPage: [String: Int]
    private let byAyah: [String: String]

    private struct SurahFile: Decodable { struct A: Decodable { let numberInSurah: Int; let text: String }; let number: Int; let ayahs: [A] }

    public init(surahDirectory: URL, ayahPage: [String: Int]) throws {
        func load(_ s: Int) throws -> SurahFile {
            try JSONDecoder().decode(SurahFile.self, from: Data(contentsOf: surahDirectory.appendingPathComponent(String(format: "surah-%03d.json", s))))
        }
        // البسملة من آية 1:1 أولًا، ثم تُحمَّل السور الباقية بالتوازي (القراءة + التطبيع هما الكلفة)؛ الترتيب محفوظ.
        let fatiha = try load(1)
        func make(_ f: SurahFile) -> [Entry] {
            f.ayahs.map { a in
                let t = QuranDisplayText.clean(a.text, surah: f.number, ayah: a.numberInSurah)   // بلا «۞» ولا بسملة مدمجة
                return Entry(ayah: "\(f.number):\(a.numberInSurah)", text: t, norm: Self.normalize(t))
            }
        }
        let lock = NSLock()
        var perSurah = [[Entry]](repeating: [], count: 115), failure: Error?
        perSurah[1] = make(fatiha)
        DispatchQueue.concurrentPerform(iterations: 113) { i in
            let n = i + 2
            do { let e = make(try load(n)); lock.lock(); perSurah[n] = e; lock.unlock() }
            catch { lock.lock(); failure = error; lock.unlock() }
        }
        if let failure { throw failure }
        let out = perSurah.flatMap { $0 }
        entries = out; self.ayahPage = ayahPage
        byAyah = Dictionary(uniqueKeysWithValues: out.map { ($0.ayah, $0.text) })
        var hay: [UInt8] = [], st: [Int] = []
        for e in out { st.append(hay.count); hay.append(contentsOf: e.norm.utf8); hay.append(0x0A) }
        haystack = hay; starts = st
    }

    static func normalize(_ text: String) -> String {
        text.split(whereSeparator: \.isWhitespace).map { QuranWordMatch.normalizeQuranWord(String($0)) }.filter { !$0.isEmpty }.joined(separator: " ")
    }

    /// نص الآية الحرفي (Tanzil) لمفتاح «سورة:آية»؛ للنسخ والمشاركة.
    public func ayahText(_ ayah: String) -> String? { byAyah[ayah] }

    public func search(_ query: String, limit: Int = 50) -> [MushafSearchHit] {
        let q = Array(Self.normalize(query).utf8)
        guard Self.normalize(query).count >= 2, !q.isEmpty else { return [] }
        var hits: [MushafSearchHit] = []
        var from = 0
        haystack.withUnsafeBufferPointer { h in
            q.withUnsafeBufferPointer { qb in
                while hits.count < limit, from < h.count, let base = h.baseAddress, let qa = qb.baseAddress {
                    guard let r = memmem(base + from, h.count - from, qa, qb.count) else { break }
                    let pos = base.distance(to: r.assumingMemoryBound(to: UInt8.self))
                    // أكبر i مع starts[i] <= pos
                    var lo = 0, hi = starts.count - 1
                    while lo < hi { let mid = (lo + hi + 1) / 2; if starts[mid] <= pos { lo = mid } else { hi = mid - 1 } }
                    let e = entries[lo]
                    hits.append(MushafSearchHit(ayah: e.ayah, page: ayahPage[e.ayah] ?? 1, text: e.text))
                    from = lo + 1 < starts.count ? starts[lo + 1] : h.count
                }
            }
        }
        return hits
    }

    /// المسح الخطي القديم (مرجع للمقارنة في الاختبارات فقط).
    func linearSearch(_ query: String, limit: Int = 50) -> [String] {
        let q = Self.normalize(query)
        guard q.count >= 2 else { return [] }
        return entries.lazy.filter { $0.norm.contains(q) }.prefix(limit).map(\.ayah)
    }
}
