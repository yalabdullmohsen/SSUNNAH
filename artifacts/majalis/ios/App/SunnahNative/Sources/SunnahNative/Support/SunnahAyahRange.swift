import Foundation

/// صيغة موحّدة لمرجع الآيات: «23:12–14» بأرقام لاتينية وشرطة en dash، مغلّفة بـLRM
/// فلا يعكسها سياق RTL (6–7 لا 7-6). أي مدى مقلوب في البيانات يُصحَّح ترتيبه هنا.
public enum SunnahAyahRange {
    private static let lrm = "\u{200E}"

    public static func format(surah: Int, from: Int, to: Int? = nil) -> String {
        let a = min(from, to ?? from), b = max(from, to ?? from)
        return lrm + (a == b ? "\(surah):\(a)" : "\(surah):\(a)–\(b)") + lrm
    }

    /// يحلّل «23:12-14» أو «23:14-12» أو بشرطة en/em وأرقام هندية؛ nil إن لم يكن مرجعًا صالحًا.
    public static func parse(_ ref: String) -> (surah: Int, from: Int, to: Int)? {
        let latin = ref.unicodeScalars.map { s -> Character in
            if (0x0660...0x0669).contains(s.value) { return Character(String(s.value - 0x0660)) }
            if (0x06F0...0x06F9).contains(s.value) { return Character(String(s.value - 0x06F0)) }
            return Character(s)
        }
        let norm = String(latin).replacingOccurrences(of: "\u{200E}", with: "").replacingOccurrences(of: "–", with: "-").replacingOccurrences(of: "—", with: "-")
        let sa = norm.split(separator: ":").map { $0.trimmingCharacters(in: .whitespaces) }
        guard sa.count == 2, let s = Int(sa[0]), (1...114).contains(s) else { return nil }
        let r = sa[1].split(separator: "-").compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
        guard let f = r.first, r.count <= 2, f >= 1 else { return nil }
        let t = r.count == 2 ? r[1] : f
        return (s, min(f, t), max(f, t))
    }

    /// مرجع منسَّق من نص خام؛ يعيد النص كما هو إن لم يُحلَّل.
    public static func display(_ ref: String) -> String {
        guard let p = parse(ref) else { return ref }
        return format(surah: p.surah, from: p.from, to: p.to)
    }

    /// مسار فتح المصحف عند أول آية في المدى.
    public static func mushafPath(_ ref: String) -> String? {
        parse(ref).map { "/mushaf/ayah/\($0.surah):\($0.from)" }
    }
}
