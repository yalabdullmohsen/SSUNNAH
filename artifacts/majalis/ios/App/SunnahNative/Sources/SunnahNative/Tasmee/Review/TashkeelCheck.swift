import Foundation

/// مقارنة الحركات بين الكلمة المتوقعة وما سُمع (هـ١). لا تحكم إلا إذا كان المسموع مُشكَّلًا فعلًا،
/// فالمحرك غير المُشكِّل يعطي `.unknown` ولا يُنتج خطأً كاذبًا. للمقارنة فقط؛ لا تمسّ نص المصحف.
public enum TashkeelCheck {
    public enum Verdict: Equatable, Sendable { case match, mismatch, unknown }

    /// الحركات الأساسية: فتحة، ضمة، كسرة، سكون، شدة، تنوينات.
    private static let core: Set<UInt32> = [0x064B, 0x064C, 0x064D, 0x064E, 0x064F, 0x0650, 0x0651, 0x0652]

    /// حرف أساس + حركاته الأساسية مرتبة؛ يتجاهل علامات الوقف والمدّ القرآنية.
    static func clusters(_ s: String) -> [(base: UInt32, marks: [UInt32])] {
        var out: [(base: UInt32, marks: [UInt32])] = []
        for u in s.unicodeScalars {
            let v = u.value
            if core.contains(v) {
                if !out.isEmpty { out[out.count - 1].marks.append(v) }
            } else if (0x0621...0x064A).contains(v) || v == 0x0671 {
                out.append((v == 0x0671 ? 0x0627 : v, []))
            }
        }
        return out.map { ($0.base, $0.marks.sorted()) }
    }

    public static func compare(expected: String, said: String, minCoverage: Double = 0.6) -> Verdict {
        let e = clusters(expected), s = clusters(said)
        guard !e.isEmpty, e.count == s.count else { return .unknown }
        let marked = s.filter { !$0.marks.isEmpty }.count
        guard Double(marked) / Double(s.count) >= minCoverage else { return .unknown }
        for (a, b) in zip(e, s) {
            if a.base != b.base { return .unknown }
            if !b.marks.isEmpty && a.marks != b.marks { return .mismatch }
        }
        return .match
    }
}
