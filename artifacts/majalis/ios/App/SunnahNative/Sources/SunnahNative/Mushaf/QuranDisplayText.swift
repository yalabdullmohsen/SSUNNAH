import Foundation

/// قاعدة واحدة لنص Tanzil المعروض للمستخدم (بحث، مشاركة، ورقة الآية، نسخ، آية اليوم، تفسير، متشابهات):
/// لا «۞» (علامة الحزب) ولا «۩» (السجدة) كنص، ولا بسملة في أول الآية 1 من أي سورة عدا الفاتحة (1:1 هي البسملة) والتوبة.
/// الحرف القرآني نفسه لا يُعدَّل؛ يُحذف فقط ما لا يُعدّ من الآية.
public enum QuranDisplayText {
    private static let decorations: Set<String> = ["\u{06DE}", "\u{06E9}"]
    private static let basmalaNormalized = "بسم الله الرحمن الرحيم".split(separator: " ").map { QuranWordMatch.normalizeQuranWord(String($0)) }

    public static func clean(_ text: String, surah: Int, ayah: Int) -> String {
        var words = text.replacingOccurrences(of: "\u{FEFF}", with: "")
            .split(whereSeparator: \.isWhitespace).map(String.init).filter { !decorations.contains($0) }
        if ayah == 1, surah != 1, surah != 9, words.count > 4, words.prefix(4).map(QuranWordMatch.normalizeQuranWord) == basmalaNormalized {
            words.removeFirst(4)
        }
        return words.joined(separator: " ")
    }
}
