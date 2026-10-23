import Foundation

/// البحث الصوتي: مطابقة تقريبية بين نص مفرَّغ من الصوت وفهرس الآيات المطبَّع (n-gram حرفي).
public struct TasmeeVoiceHit: Equatable, Sendable {
    public let ayah: String
    public let score: Double
}

public struct TasmeeVoiceSearch: Sendable {
    private struct Entry: Sendable { let ayah: String; let grams: Set<String> }
    private let entries: [Entry]
    private let n: Int

    /// `index`: (معرّف الآية «س:آ»، نصها بعد التطبيع). `n`: طول القطعة الحرفية.
    public init(index: [(ayah: String, norm: String)], n: Int = 3) {
        self.n = n
        entries = index.map { Entry(ayah: $0.ayah, grams: Self.grams($0.norm, n)) }
    }

    static func grams(_ s: String, _ n: Int) -> Set<String> {
        let c = Array(s.filter { !$0.isWhitespace })
        guard c.count >= n else { return c.isEmpty ? [] : [String(c)] }
        return Set((0...(c.count - n)).map { String(c[$0..<($0 + n)]) })
    }

    /// أعلى `limit` آيات. الدرجة = نسبة قطع المقطع المسموع الموجودة في الآية (احتواء)، وتُرجَّح الآية الأقصر عند التعادل.
    public func search(_ heard: String, limit: Int = 3) -> [TasmeeVoiceHit] {
        let q = Self.grams(heard, n)
        guard !q.isEmpty else { return [] }
        return entries.compactMap { e -> TasmeeVoiceHit? in
            let common = q.intersection(e.grams).count
            guard common > 0 else { return nil }
            let contain = Double(common) / Double(q.count)
            let jaccard = Double(common) / Double(q.union(e.grams).count)
            return TasmeeVoiceHit(ayah: e.ayah, score: 0.8 * contain + 0.2 * jaccard)
        }
        .sorted { $0.score != $1.score ? $0.score > $1.score : $0.ayah < $1.ayah }
        .prefix(limit).map { $0 }
    }
}
