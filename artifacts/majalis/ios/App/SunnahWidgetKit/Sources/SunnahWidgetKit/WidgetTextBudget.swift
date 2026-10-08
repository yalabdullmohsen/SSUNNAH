import Foundation

/// ميزانية نصوص الودجات: لا قصّ ولا حذف؛ كل نص قصير بسقف حروف يناسب مساحته.
public enum WidgetTextBudget {
    /// اسم صلاة/مناسبة/شهر في خلية أو سطر واحد.
    public static let name = 14
    /// عنوان صغير (أذكار الصباح…).
    public static let title = 16
    /// ذكر الساعة: ست كلمات كحد أقصى.
    public static let dhikrWords = 6
    public static let dhikrChars = 36
    /// أدنى حجم خط (pt) وأدنى مقياس تصغير مسموحان.
    public static let minFontSize: Double = 11
    public static let minScale: Double = 0.8

    public static func fits(_ text: String, maxChars: Int) -> Bool {
        text.count <= maxChars
    }

    public static func wordCount(_ text: String) -> Int {
        text.split(whereSeparator: { $0 == " " || $0 == "\n" }).count
    }

    /// نسبة التقدّم بين صلاتين؛ مقيّدة في [0, 1].
    public static func progress(now: Date, from start: Date, to end: Date) -> Double {
        let total = end.timeIntervalSince(start)
        guard total > 0 else { return 0 }
        return min(1, max(0, now.timeIntervalSince(start) / total))
    }
}
