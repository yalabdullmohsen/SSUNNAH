import Foundation

/// العدد مع تمييزه بقواعد العربية وأرقام عربية (على نهج arabicCountLabel في الويب، مع المئات).
/// ١ «واحد»، ٢ مثنى، ٣–١٠ جمع، ١١–٩٩ مفرد منصوب. فوق المئة يُحكم بآخر رقمين: ٠–٢ مفرد مجرور («١٠٠ يوم»)، والباقي كما سبق.
enum ArabicCount {
    static func label(_ n: Int, one: String, two: String, few: String, many: String, genitive: String) -> String {
        if n == 1 { return one }
        if n == 2 { return two }
        let noun: String
        switch n < 100 ? n : n % 100 {
        case 3...10: noun = few
        case 11...99: noun = many
        default: noun = genitive
        }
        return "\(n.arabicDigits) \(noun)"
    }
}
