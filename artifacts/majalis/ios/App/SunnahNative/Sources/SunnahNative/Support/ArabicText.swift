import Foundation

/// تطبيع عربي مشترك للبحث: يُسقط التشكيل والتطويل ويوحّد الأرقام العربية/الهندية إلى لاتينية والهمزات والتاء المربوطة والألف المقصورة.
public enum ArabicText {
    public static func normalize(_ s: String) -> String {
        var out = String.UnicodeScalarView()
        for u in s.unicodeScalars {
            switch u.value {
            case 0x064B...0x065F, 0x0670, 0x0640: continue
            case 0x0660...0x0669: out.append(Unicode.Scalar(0x30 + u.value - 0x0660)!)
            case 0x06F0...0x06F9: out.append(Unicode.Scalar(0x30 + u.value - 0x06F0)!)
            case 0x0622, 0x0623, 0x0625, 0x0671: out.append("\u{0627}")
            case 0x0629: out.append("\u{0647}")
            case 0x0649: out.append("\u{064A}")
            default: out.append(u)
            }
        }
        return String(out).lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
    }

    public static func matches(_ text: String, query: String) -> Bool {
        let q = normalize(query)
        return q.isEmpty || normalize(text).contains(q)
    }
}
