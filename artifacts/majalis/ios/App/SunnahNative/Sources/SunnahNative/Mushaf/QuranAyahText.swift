import SwiftUI

/// مدى آيات في سورة واحدة بصيغة موحّدة: «6–7» أو «6-7» أو «6» (أو «12:6–7» بالسورة).
public struct QuranAyahRange: Equatable, Sendable, Hashable {
    public let surah: Int
    public let from: Int
    public let to: Int

    public init?(surah: Int, from: Int, to: Int) {
        guard (1...114).contains(surah), from >= 1, to >= from else { return nil }
        self.surah = surah; self.from = from; self.to = to
    }

    /// «6–7» / «6-7» / «6» مع رقم السورة، أو «12:6–7» كاملة.
    public static func parse(_ s: String, surah: Int? = nil) -> QuranAyahRange? {
        let norm = s.replacingOccurrences(of: "–", with: "-").replacingOccurrences(of: "—", with: "-")
            .trimmingCharacters(in: .whitespaces)
        var surahNo = surah
        var rest = norm
        if let colon = norm.firstIndex(of: ":") {
            guard let n = Int(norm[..<colon]) else { return nil }
            surahNo = n; rest = String(norm[norm.index(after: colon)...])
        }
        guard let sn = surahNo else { return nil }
        let parts = rest.split(separator: "-", omittingEmptySubsequences: false)
        switch parts.count {
        case 1: guard let a = Int(parts[0]) else { return nil }; return QuranAyahRange(surah: sn, from: a, to: a)
        case 2: guard let a = Int(parts[0]), let b = Int(parts[1]) else { return nil }; return QuranAyahRange(surah: sn, from: a, to: b)
        default: return nil
        }
    }

    public var keys: [String] { (from...to).map { "\(surah):\($0)" } }
    public var label: String { from == to ? "\(surah):\(from)" : "\(surah):\(from)–\(to)" }
}

/// آية من مصدر المصحف (Tanzil) بالمرجع لا بنصٍّ ملصوق.
public struct QuranAyah: Equatable, Sendable, Identifiable {
    public var id: String { "\(surah):\(number)" }
    public let surah: Int
    public let number: Int
    public let text: String
}

public extension MushafSearch {
    /// آيات المدى بنص المصحف الحرفي؛ تتوقف عند أول آية غير موجودة (مدى يتجاوز السورة يُقصّ).
    func ayahs(surah: Int, from: Int, to: Int) -> [QuranAyah] {
        guard let r = QuranAyahRange(surah: surah, from: from, to: to) else { return [] }
        return ayahs(in: r)
    }

    func ayahs(in r: QuranAyahRange) -> [QuranAyah] {
        var out: [QuranAyah] = []
        for n in r.from...r.to {
            guard let t = ayahText("\(r.surah):\(n)") else { break }
            out.append(QuranAyah(surah: r.surah, number: n, text: t))
        }
        return out
    }
}

/// المكوّن الوحيد لعرض أي نص قرآني بخط المصحف (QPC) وترميزه: قصص، بحث، مشاركة، بطاقات، حديث، تفسير، ودجات.
/// المصدر مرجع (سورة/من/إلى) لا نص ملصوق. «لا آية بخط النظام».
public struct QuranAyahText: View {
    let range: QuranAyahRange
    let repo: MushafRepository
    let size: CGFloat
    let paper: Bool
    let collapseAbove: Int

    /// الآية تُعرض كاملة افتراضيًا (القصص والمشاركة لا تُقصّ)؛ مرّري `collapseAbove` لقصّ القوائم.
    public init(range: QuranAyahRange, repo: MushafRepository, size: CGFloat = 24, paper: Bool = true, collapseAbove: Int = .max) {
        self.range = range; self.repo = repo; self.size = size; self.paper = paper; self.collapseAbove = collapseAbove
    }

    public init?(surah: Int, from: Int, to: Int? = nil, repo: MushafRepository, size: CGFloat = 24, paper: Bool = true, collapseAbove: Int = .max) {
        guard let r = QuranAyahRange(surah: surah, from: from, to: to ?? from) else { return nil }
        self.init(range: r, repo: repo, size: size, paper: paper, collapseAbove: collapseAbove)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(range.keys, id: \.self) { key in
                MushafAyahText(ayah: key, repo: repo, size: size, collapseAbove: collapseAbove, paper: paper)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }
}
