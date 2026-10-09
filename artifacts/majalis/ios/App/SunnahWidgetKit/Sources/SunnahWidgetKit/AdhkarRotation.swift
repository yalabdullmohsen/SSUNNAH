import Foundation

/// ذكر الساعة: اختيار حتمي من مجموعة أذكار معتمدة جاهزة، دون أي نص يُكتب هنا.
/// الفهرس = (رقم اليوم في السنة × 24 + الساعة) ⇒ يتغيّر كل ساعة ويتكرر نفسه لنفس الساعة.
public enum AdhkarRotation {
    /// يُبقي الأذكار التي لا تتجاوز ست كلمات فقط، حرفيًا ودون قصّ، بلا تكرار.
    public static func eligible(_ pool: [String]) -> [String] {
        var seen = Set<String>()
        return pool.compactMap { raw in
            let text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !text.isEmpty,
                  WidgetTextBudget.wordCount(text) <= WidgetTextBudget.dhikrWords,
                  seen.insert(text).inserted else { return nil }
            return text
        }
    }

    public static func index(count: Int, at date: Date, timeZone: TimeZone) -> Int {
        guard count > 0 else { return 0 }
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        let day = cal.ordinality(of: .day, in: .year, for: date) ?? 1
        let hour = cal.component(.hour, from: date)
        return (day * 24 + hour) % count
    }

    public static func pick(from pool: [String], at date: Date, timeZone: TimeZone) -> String? {
        let items = eligible(pool)
        guard !items.isEmpty else { return nil }
        return items[index(count: items.count, at: date, timeZone: timeZone)]
    }

    /// بدايات الساعات القادمة (للجدول الزمني): كل مدخل يعرض ذكر ساعته.
    public static func hourStarts(after date: Date, timeZone: TimeZone, count: Int) -> [Date] {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        guard let first = cal.nextDate(after: date, matching: DateComponents(minute: 0, second: 0), matchingPolicy: .nextTime) else { return [] }
        return (0..<max(count, 0)).compactMap { cal.date(byAdding: .hour, value: $0, to: first) }
    }
}
