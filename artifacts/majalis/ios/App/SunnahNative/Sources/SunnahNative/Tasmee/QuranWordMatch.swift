import Foundation

/// مطابقة الكلمات القرآنية المطبَّعة (نقية): نسخة Swift حرفية من
/// `src/shared/arabic-normalize.ts` + `src/lib/quran-text-normalize.ts` + `src/lib/quran-word-match.ts`.
/// للمقارنة الصوتية فقط؛ لا تمسّ نص المصحف المعروض.
public enum QuranWordMatch {
    private static func isTashkeel(_ v: UInt32) -> Bool {
        (0x064B...0x065F).contains(v) || v == 0x0670 || (0x0610...0x061A).contains(v)
            || (0x06D6...0x06DC).contains(v) || (0x06DF...0x06E4).contains(v)
            || (0x06E7...0x06ED).contains(v) || (0x06E5...0x06E6).contains(v)
    }

    private static func isInvisible(_ v: UInt32) -> Bool {
        (0x200B...0x200F).contains(v) || (0x202A...0x202E).contains(v) || v == 0x2060
            || (0x2066...0x2069).contains(v) || v == 0xFEFF
    }

    private static let punctuation: Set<UInt32> = Set(",.;!?،؛؟«»\"'()[]{}-—…".unicodeScalars.map(\.value))

    /// ما يقابل normalizeArabic (التطبيع المشترك).
    static func normalizeArabic(_ text: String) -> String {
        var out: [UInt32] = []
        let scalars = Array(text.unicodeScalars)
        var i = 0
        while i < scalars.count {
            var v = scalars[i].value
            i += 1
            if v == 0x00A0 { v = 0x20 }
            if isInvisible(v) || isTashkeel(v) { continue }
            // أرقام هندية/فارسية → لاتينية
            if (0x0660...0x0669).contains(v) { v = 0x30 + (v - 0x0660) }
            else if (0x06F0...0x06F9).contains(v) { v = 0x30 + (v - 0x06F0) }
            // لاتيني صغير
            if (0x41...0x5A).contains(v) { v += 0x20 }
            switch v {
            case 0xFEF5, 0xFEF7, 0xFEF9, 0xFEFB: out.append(0x644); out.append(0x627)   // لام ألف مركّبة
            case 0x623, 0x625, 0x622, 0x671, 0x672, 0x673: out.append(0x627)            // أشكال الألف
            case 0x626:                                                                  // ئ: ئو → وو وإلا ي
                if i < scalars.count, scalars[i].value == 0x648 { out.append(0x648) } else { out.append(0x64A) }
            case 0x624: out.append(0x648)                                                // ؤ → و
            case 0x649, 0x6CC: out.append(0x64A)                                         // ى ی → ي
            case 0x629: out.append(0x647)                                                // ة → ه
            case 0x6A9: out.append(0x643)                                                // ک → ك
            case 0x621, 0x640: continue                                                  // ء وكشيدة
            default:
                if punctuation.contains(v) { out.append(0x20) }
                else if v == 0x3A {
                    let prevDigit = out.last.map { (0x30...0x39).contains($0) } ?? false
                    let nextDigit = i < scalars.count && (0x30...0x39).contains(scalars[i].value)
                    out.append(prevDigit && nextDigit ? 0x3A : 0x20)
                } else { out.append(v) }
            }
        }
        var s = String(String.UnicodeScalarView(out.compactMap(Unicode.Scalar.init)))
        s = s.split(whereSeparator: { $0.isWhitespace }).joined(separator: " ")
        return s
    }

    /// مرادفات الرسم العثماني ← صورة كنسية واحدة (كلا الاتجاهين).
    private static let synonyms: [String: String] = {
        let pairs = [("الصلوه", "الصلاه"), ("الزكوه", "الزكاه"), ("الحيوه", "الحياه"), ("مشكوه", "مشكاه"),
                     ("ابرهيم", "ابراهيم"), ("اسحق", "اسحاق"), ("اسمعيل", "اسماعيل"), ("العلمين", "العالمين")]
        var m: [String: String] = [:]
        for (u, mod) in pairs { m[u] = u; m[mod] = u }
        return m
    }()

    public static func normalizeQuranWord(_ word: String) -> String {
        var clean = word
        if clean.unicodeScalars.first?.value == 0xFEFF { clean.unicodeScalars.removeFirst() }
        let base = normalizeArabic(clean)
        return synonyms[base] ?? base
    }

    public static func editDistance(_ a: [Unicode.Scalar], _ b: [Unicode.Scalar]) -> Int {
        if a == b { return 0 }
        let m = a.count, n = b.count
        if m == 0 { return n }
        if n == 0 { return m }
        var prev = Array(0...n)
        for i in 1...m {
            var cur = [i] + Array(repeating: 0, count: n)
            for j in 1...n {
                cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1))
            }
            prev = cur
        }
        return prev[n]
    }

    public static func wordSimilarity(_ a: String, _ b: String) -> Double {
        if a == b { return 1 }
        let x = Array(a.unicodeScalars), y = Array(b.unicodeScalars)
        let longest = max(x.count, y.count)
        return longest == 0 ? 1 : 1 - Double(editDistance(x, y)) / Double(longest)
    }

    /// «asr» يتسامح بحرف واحد حين تبلغ الأقصر 6 أحرف فأكثر؛ «strict» تطابق تام.
    public static func wordsMatch(_ ref: String, _ heard: String, strict: Bool = false) -> Bool {
        if ref == heard { return true }
        if strict { return false }
        let x = Array(ref.unicodeScalars), y = Array(heard.unicodeScalars)
        if min(x.count, y.count) < 6 { return false }
        return editDistance(x, y) <= 1
    }

    /// يفكّ المنطوق إلى كلمات مطبَّعة مع إبقاء الأصل.
    public static func tokenizeSpoken(_ transcript: String) -> [(raw: String, norm: String)] {
        let strip = Set(".,،؛:!؟?\"«»()[]{}…".unicodeScalars)
        return transcript.split(whereSeparator: { $0.isWhitespace }).compactMap { piece in
            let raw = String(String.UnicodeScalarView(piece.unicodeScalars.filter { !strip.contains($0) }))
            guard !raw.isEmpty else { return nil }
            let norm = normalizeQuranWord(raw)
            return norm.isEmpty ? nil : (raw, norm)
        }
    }

    /// صيغتا الكلمة المرجعية: القياسية، وصيغة تحوّل الألف الخنجرية إلى ألف.
    public static func quranWordForms(_ raw: String) -> [String] {
        let plain = normalizeQuranWord(raw)
        let withAlef = normalizeQuranWord(raw.replacingOccurrences(of: "\u{0670}", with: "ا"))
        return plain == withAlef ? [plain] : [plain, withAlef]
    }

    public static func bestWordSimilarity(_ heard: String, _ forms: [String]) -> Double {
        forms.reduce(0) { max($0, wordSimilarity(heard, $1)) }
    }
}
