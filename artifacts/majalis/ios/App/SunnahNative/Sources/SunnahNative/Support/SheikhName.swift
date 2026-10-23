import Foundation

/// نسخة Swift من `src/lib/sheikh-name.ts`: حذف الألقاب («الشيخ»، «فضيلة»، «د.»…) لمقارنة أسماء المشايخ وتجميعها.
enum SheikhName {
    private static let honorific = try! NSRegularExpression(
        pattern: #"^(?:فضيلة|معالي|سمو|صاحب|العلامة|الشيخ(?:ة)?(?:\s+الدكتور(?:ة)?|\s+د\.?)?|الدكتور(?:ة)?|د\.|Dr\.?|الأستاذ(?:ة)?|القارئ)\s+"#,
        options: [.caseInsensitive])
    private static let degree = try! NSRegularExpression(pattern: #"^(?:د\.|Dr\.)\s*"#, options: [.caseInsensitive])
    private static let label = try! NSRegularExpression(pattern: #"^(?:الشيخة?|الدكتور(?:ة)?|الأستاذ(?:ة)?|القارئ)\s*[:：]\s*"#, options: [.caseInsensitive])
    private static let bareTitles: Set<String> = ["الشيخ", "الشيخة", "الدكتور", "الدكتورة", "الأستاذ", "الأستاذة", "القارئ", "د."]

    private static func strip(_ re: NSRegularExpression, _ s: String) -> String {
        re.stringByReplacingMatches(in: s, range: NSRange(s.startIndex..., in: s), withTemplate: "")
    }

    /// الاسم بلا ألقاب؛ لقب بلا اسم ← "".
    static func stripHonorifics(_ name: String) -> String {
        var value = name.trimmingCharacters(in: .whitespacesAndNewlines)
        for _ in 0..<6 {
            let next = strip(degree, strip(honorific, strip(label, value))).trimmingCharacters(in: .whitespacesAndNewlines)
            if next == value { break }
            value = next
        }
        value = value.split(whereSeparator: \.isWhitespace).joined(separator: " ")
        return bareTitles.contains(value) ? "" : value
    }

    /// مفتاح المقارنة كـ`sheikhNameKey`.
    static func key(_ name: String) -> String { stripHonorifics(name).lowercased() }
}
