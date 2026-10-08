import Foundation

/// تنسيق موحّد لنصوص الودجات: عربي بأرقام لاتينية 0-9 (قرار المالك)، ووحدات وجمع عربي صحيح.
public enum WidgetFormat {
    /// لغة موحّدة لكل Text/DateFormatter/NumberFormatter: عربي بأرقام لاتينية.
    public static let locale = Locale(identifier: "ar-u-nu-latn")

    public static func digits(_ value: Int) -> String { String(value) }

    /// 4:27 ص — الساعة والدقيقة بأرقام لاتينية (12 ساعة) مع لاحقة ص/م منفصلة لتصغيرها في العرض.
    public static func timeParts(_ date: Date, timeZone: TimeZone) -> (clock: String, suffix: String) {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        let c = cal.dateComponents([.hour, .minute], from: date)
        let h24 = c.hour ?? 0, m = c.minute ?? 0
        let h12 = h24 % 12 == 0 ? 12 : h24 % 12
        return ("\(h12):\(m < 10 ? "0" : "")\(m)", h24 < 12 ? "ص" : "م")
    }

    public static func time(_ date: Date, timeZone: TimeZone) -> String {
        let p = timeParts(date, timeZone: timeZone)
        return "\(p.clock) \(p.suffix)"
    }

    /// 9 أكتوبر 2026 — ميلادي بأسماء عربية وأرقام لاتينية.
    public static let gregorianMonthsAr = [
        "", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
    ]
    public static let weekdaysAr = ["", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

    public static func gregorian(_ date: Date, timeZone: TimeZone) -> String {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        let c = cal.dateComponents([.year, .month, .day], from: date)
        return "\(c.day ?? 0) \(gregorianMonthsAr[c.month ?? 0]) \(c.year ?? 0)"
    }

    public static func weekday(_ date: Date, timeZone: TimeZone) -> String {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        return weekdaysAr[cal.component(.weekday, from: date)]
    }

    /// 1 يوم، 2 يومان، 3–10 أيام، 11 فأكثر يومًا.
    public static func days(_ count: Int) -> String {
        let n = max(0, count)
        switch n {
        case 2: return "\(digits(n)) يومان"
        case 3...10: return "\(digits(n)) أيام"
        case 11...: return "\(digits(n)) يومًا"
        default: return "\(digits(n)) يوم"
        }
    }

    /// عدّاد مناسبة قادمة: 0 «اليوم»، 1 «غدًا»، 2 «بعد يومين»، 3… «بعد 3 أيام».
    public static func daysUntil(_ count: Int) -> String {
        switch max(0, count) {
        case 0: return "اليوم"
        case 1: return "غدًا"
        case 2: return "بعد يومين"
        default: return "بعد \(days(count))"
        }
    }

    /// أيام السلسلة (streak): 1 «يوم واحد»، وغيره كالمعتاد.
    public static func streak(_ count: Int) -> String {
        count == 1 ? "يوم واحد" : days(count)
    }

    /// وحدة الأيام وحدها (للعرض بجانب رقم مستقل).
    public static func dayUnit(_ count: Int) -> String {
        switch max(0, count) {
        case 2: return "يومان"
        case 3...10: return "أيام"
        case 11...: return "يومًا"
        default: return "يوم"
        }
    }

    /// مدة ثابتة للعرض: «3 س 12 د» أو «45 د».
    public static func duration(seconds: Int) -> String {
        let minutes = max(0, seconds) / 60
        let hours = minutes / 60
        if hours > 0 { return "\(digits(hours)) س \(digits(minutes % 60)) د" }
        return "\(digits(minutes)) د"
    }
}
