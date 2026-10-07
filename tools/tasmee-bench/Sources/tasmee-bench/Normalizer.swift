import Foundation

/// تطبيع عربي للمطابقة: يزيل التشكيل والتطويل، ويوحّد الألف/الهمزات والتاء المربوطة والألف المقصورة.
/// النصّان الناتجان: `withDagger` يحوّل الألف الخنجرية إلى ألف («ملك» → «مالك») و`plain` يحذفها؛ تُقارَن الصيغتان.
enum ArabicNormalizer {
    private static let combining: Set<UInt32> = {
        var s = Set<UInt32>()
        for c in 0x064B...0x065F { s.insert(UInt32(c)) }      // فتحة…سكون…
        for c in 0x06D6...0x06ED { s.insert(UInt32(c)) }      // علامات الوقف وعلامات قرآنية صغيرة
        s.insert(0x0640)                                        // تطويل
        s.insert(0x08D3); s.insert(0x08D4)
        return s
    }()

    static func normalize(_ input: String, daggerAsAlef: Bool) -> String {
        var out = String.UnicodeScalarView()
        for u in input.unicodeScalars {
            let v = u.value
            if v == 0x0670 { if daggerAsAlef { out.append(UnicodeScalar(0x0627)!) }; continue }   // ألف خنجرية
            if combining.contains(v) { continue }
            switch v {
            case 0x0623, 0x0625, 0x0622, 0x0671: out.append(UnicodeScalar(0x0627)!)   // أ إ آ ٱ → ا
            case 0x0629: out.append(UnicodeScalar(0x0647)!)                            // ة → ه
            case 0x0649: out.append(UnicodeScalar(0x064A)!)                            // ى → ي
            case 0x0624: out.append(UnicodeScalar(0x0648)!)                            // ؤ → و
            case 0x0626: out.append(UnicodeScalar(0x064A)!)                            // ئ → ي
            case 0x0621: continue                                                      // ء
            case 0x06A9: out.append(UnicodeScalar(0x0643)!)                            // ک → ك
            case 0x06CC: out.append(UnicodeScalar(0x064A)!)                            // ی → ي
            default:
                if (0x0621...0x064A).contains(v) { out.append(u) }  // حروف عربية فقط
                // غير ذلك (ترقيم/أرقام/لاتيني) يُحذف
            }
        }
        return String(out)
    }

    /// تقسيم نص مفرَّغ إلى كلمات مطبَّعة.
    static func tokens(_ text: String) -> [String] {
        text.split(whereSeparator: { $0.isWhitespace || $0 == "،" || $0 == "." || $0 == "؟" })
            .map { normalize(String($0), daggerAsAlef: false) }
            .filter { !$0.isEmpty }
    }

    static func similarity(_ a: String, _ b: String) -> Double {
        if a == b { return 1 }
        let x = Array(a), y = Array(b)
        if x.isEmpty || y.isEmpty { return 0 }
        var prev = Array(0...y.count)
        for i in 1...x.count {
            var cur = [i] + Array(repeating: 0, count: y.count)
            for j in 1...y.count {
                cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] == y[j - 1] ? 0 : 1))
            }
            prev = cur
        }
        return 1 - Double(prev[y.count]) / Double(max(x.count, y.count))
    }
}
