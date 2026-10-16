import Foundation

/// حالات ودجت الصلاة الثلاث (نقية، قابلة للاختبار بالدقيقة):
/// 1) قبل الأذان: «بقي على <القادمة>» عدّ تنازلي.
/// 2) من الأذان إلى +النافذة (30 د): «حان وقت <الصلاة>» مع «مضى» عدّ تصاعدي.
/// 3) عند +النافذة: يعود إلى «بقي على <التالية>» مع «مضى على <الحالية>».
public enum PrayerPhase: Equatable {
    case before(next: Date)
    case inWindow(adhan: Date, until: Date, next: Date?)
    case afterWindow(since: Date, next: Date?)
    case none

    public static let defaultWindow: TimeInterval = 30 * 60

    /// `adhans`: أذانات الفروض مرتبة أو غير مرتبة (تشمل الغد لتغطية الفجر بعد العشاء).
    public static func resolve(now: Date, adhans: [Date], window: TimeInterval = defaultWindow) -> PrayerPhase {
        let sorted = adhans.sorted()
        let next = sorted.first { $0 > now }
        guard let cur = sorted.last(where: { $0 <= now }) else {
            return next.map { .before(next: $0) } ?? .none
        }
        let end = cur.addingTimeInterval(window)
        return now < end ? .inWindow(adhan: cur, until: end, next: next) : .afterWindow(since: cur, next: next)
    }

    /// لحظات تغيّر الحالة بعد `now`: كل أذان وكل أذان+النافذة (مرتبة، فريدة).
    public static func boundaries(after now: Date, adhans: [Date], window: TimeInterval = defaultWindow) -> [Date] {
        Array(Set(adhans.flatMap { [$0, $0.addingTimeInterval(window)] }.filter { $0 > now })).sorted()
    }
}
