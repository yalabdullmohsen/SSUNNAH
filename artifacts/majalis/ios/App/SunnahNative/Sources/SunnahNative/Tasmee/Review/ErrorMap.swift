import Foundation

/// درجة ضعف آية في خريطة الأخطاء (لتلوينها في «حفظي» وهامش الصفحة).
public enum TasmeeAyahWeakness: Int, Sendable, Comparable {
    case none = 0, mild, medium, strong
    public static func < (a: Self, b: Self) -> Bool { a.rawValue < b.rawValue }
}

public enum TasmeeErrorMap {
    /// الدرجة من بنك الكلمات الضعيفة: مجموع التعثرات في الآية (misses)،
    /// وتخفّ الدرجة بارتقاء الصناديق (كلمة في صندوق عالٍ أقل وزنًا).
    public static func weakness(_ bank: [TasmeeWeakWord]) -> [String: TasmeeAyahWeakness] {
        var score: [String: Double] = [:]
        for w in bank {
            let weight = Double(w.misses) / Double(1 + w.box)
            score["\(w.surah):\(w.ayah)", default: 0] += weight
        }
        return score.mapValues { s in s >= 4 ? .strong : s >= 2 ? .medium : s > 0 ? .mild : .none }
    }

    /// أشدّ درجة بين آيات صفحة معيّنة (للهامش).
    public static func pageWeakness(ayahs: [(surah: Int, ayah: Int)], map: [String: TasmeeAyahWeakness]) -> TasmeeAyahWeakness {
        ayahs.map { map["\($0.surah):\($0.ayah)"] ?? .none }.max() ?? .none
    }

    /// أشدّ درجة لكل صفحة، من فهرس الآية←الصفحة الجاهز (قراءة فقط؛ لا مسّ بتعيين الصفحات).
    public static func pages(map: [String: TasmeeAyahWeakness], ayahPage: [String: Int]) -> [Int: TasmeeAyahWeakness] {
        var out: [Int: TasmeeAyahWeakness] = [:]
        for (k, w) in map where w > .none {
            guard let pg = ayahPage[k] else { continue }
            out[pg] = max(out[pg] ?? .none, w)
        }
        return out
    }
}
