import Foundation

/// روابط المصحف العميقة: `/mushaf/page/{1…604}` و`/mushaf/ayah/{سورة}:{آية}` (ودجت «أين توقفت» وروابط الآيات).
public enum MushafRoute: Equatable, Sendable {
    case page(Int)
    case ayah(surah: Int, ayah: Int)

    /// يعيد nil لما ليس رابط مصحف عميقًا أو قيمته خارج النطاق (فلا تُفتح صفحة خاطئة بصمت).
    public static func parse(_ path: String) -> MushafRoute? {
        let comps = path.split(separator: "/").map(String.init)
        guard comps.count == 3, comps[0] == "mushaf" else { return nil }
        switch comps[1] {
        case "page":
            guard let n = Int(comps[2]), (1...Mushaf.pageCount).contains(n) else { return nil }
            return .page(n)
        case "ayah":
            let p = comps[2].split(separator: ":").compactMap { Int($0) }
            guard p.count == 2, (1...114).contains(p[0]), p[1] >= 1 else { return nil }
            return .ayah(surah: p[0], ayah: p[1])
        default: return nil
        }
    }
}
