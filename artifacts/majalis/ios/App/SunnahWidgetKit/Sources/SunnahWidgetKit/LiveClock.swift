import Foundation

/// منطق العدّ الحي لودجات الصلاة (نقي، قابل للاختبار): يحدّد اتجاه العدّ ولحظاته،
/// ويصيغ النص الثابت بنفس صيغة النص الحي (mm:ss أقل من ساعة، h:mm:ss من ساعة، أرقام هندية).
public enum LiveClock {
    public enum Mode: Equatable {
        /// الصلاة الحالية: عدّ تصاعدي منذ دخول الوقت.
        case countUp(since: Date)
        /// الصلاة التالية: عدّ تنازلي حتى دخولها.
        case countDown(until: Date)
        /// دخل وقتها ولم تُحدَّث البيانات بعد.
        case started
        case none
    }

    /// يختار الاتجاه: نافذة ما بعد الأذان ← تصاعدي، وإلا ← تنازلي إلى التالية.
    public static func resolve(now: Date, elapsedStart: Date?, nextDate: Date?, nextHasStarted: Bool) -> Mode {
        if let start = elapsedStart, start <= now { return .countUp(since: start) }
        if nextHasStarted { return .started }
        if let next = nextDate, next > now { return .countDown(until: next) }
        return .none
    }

    /// عدّ تصاعدي منذ بداية الصلاة الحالية (الودجات التي تعرض «الحالية» دائمًا).
    public static func current(now: Date, start: Date?) -> Mode {
        guard let start, start <= now else { return .none }
        return .countUp(since: start)
    }

    /// الساعات تظهر فقط حين يبلغ الزمن ساعة فأكثر.
    public static func showsHours(seconds: TimeInterval) -> Bool { seconds >= 3600 }

    /// mm:ss بدقيقتين وثانيتين (٠٦:٣٠) أقل من ساعة، وh:mm:ss (١:٠٦:٣٠) من ساعة فأكثر.
    public static func format(seconds: TimeInterval) -> String {
        let total = max(0, Int(seconds.rounded(.down)))
        let h = total / 3600, m = (total % 3600) / 60, s = total % 60
        let mm = two(m), ss = two(s)
        return h > 0 ? "\(WidgetFormat.digits(h)):\(mm):\(ss)" : "\(mm):\(ss)"
    }

    /// النص الثابت لوضع معيّن عند لحظة `now` (للمعرض واللقطات وعند تعطيل العدّ الحي).
    public static func staticText(_ mode: Mode, now: Date) -> String? {
        switch mode {
        case .countUp(let since): return format(seconds: now.timeIntervalSince(since))
        case .countDown(let until): return format(seconds: until.timeIntervalSince(now))
        case .started: return "الآن"
        case .none: return nil
        }
    }

    private static func two(_ v: Int) -> String {
        WidgetFormat.digits(v / 10) + WidgetFormat.digits(v % 10)
    }
}
