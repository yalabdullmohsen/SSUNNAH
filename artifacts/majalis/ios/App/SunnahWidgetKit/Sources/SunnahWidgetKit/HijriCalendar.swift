import Foundation

public struct HijriDate: Equatable, Sendable {
    public let year: Int
    public let month: Int
    public let day: Int
}

/// التاريخ الهجري (أم القرى) كدوال نقية؛ مصدر واحد للودجات والمعرض.
public enum HijriCalendar {
    public static let monthNamesAr = [
        "", "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
        "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
    ]

    private static func islamic(_ tz: TimeZone) -> Calendar {
        var c = Calendar(identifier: .islamicUmmAlQura)
        c.timeZone = tz
        return c
    }

    public static func date(_ date: Date, timeZone: TimeZone) -> HijriDate {
        let c = islamic(timeZone).dateComponents([.year, .month, .day], from: date)
        return HijriDate(year: c.year ?? 0, month: c.month ?? 0, day: c.day ?? 0)
    }

    public static func display(_ h: HijriDate) -> String {
        let name = monthNamesAr.indices.contains(h.month) ? monthNamesAr[h.month] : ""
        return "\(WidgetFormat.digits(h.day)) \(name) \(WidgetFormat.digits(h.year))"
    }

    /// عدد الأيام حتى أقرب (شهر، يوم) هجري قادم؛ ٠ إن كان اليوم نفسه. nil إن لم يوجد خلال ٤٠٠ يوم.
    public static func daysUntil(month: Int, day: Int, from now: Date, timeZone: TimeZone) -> Int? {
        let cal = islamic(timeZone)
        let start = cal.startOfDay(for: now)
        for offset in 0...400 {
            guard let d = cal.date(byAdding: .day, value: offset, to: start) else { return nil }
            let c = cal.dateComponents([.month, .day], from: d)
            if c.month == month, c.day == day { return offset }
        }
        return nil
    }
}
