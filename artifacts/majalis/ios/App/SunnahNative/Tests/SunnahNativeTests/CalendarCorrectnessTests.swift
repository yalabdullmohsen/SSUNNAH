import XCTest
@testable import SunnahNative

/// صحّة تقويم الدروس بالتقويم الافتراضي للتطبيق (لا تقويمًا مخصصًا) عبر أشهر متعددة.
final class CalendarCorrectnessTests: XCTestCase {
    private let ref: Calendar = {
        var c = Calendar(identifier: .gregorian)
        c.locale = Locale(identifier: "en_US_POSIX")
        c.timeZone = TimeZone(identifier: "Asia/Kuwait")!
        return c
    }()

    private func noon(_ y: Int, _ m: Int, _ d: Int) -> Date {
        ref.date(from: DateComponents(year: y, month: m, day: d, hour: 12))!
    }

    func testDefaultCalendarStartsOnSunday() {
        XCTAssertEqual(AccountCalendarMath.gregorian.firstWeekday, 1)
    }

    func testKnownWeekdays() {
        // 1 أكتوبر 2026 خميس، 14 أكتوبر 2026 أربعاء.
        let grid = AccountCalendarMath.monthGrid(for: noon(2026, 10, 14), calendar: ref.withSunday())
        let cal = ref.withSunday()
        let first = grid.first { cal.component(.day, from: $0) == 1 && cal.component(.month, from: $0) == 10 }!
        XCTAssertEqual(AccountCalendarMath.weekdayLabels[cal.component(.weekday, from: first) - 1], "الخميس")
        let mid = grid.first { cal.component(.day, from: $0) == 14 && cal.component(.month, from: $0) == 10 }!
        XCTAssertEqual(AccountCalendarMath.weekdayLabels[cal.component(.weekday, from: mid) - 1], "الأربعاء")
    }

    /// الشبكة الفعلية للتطبيق: العمود الأول أحد، واليوم 1 في عموده الصحيح، لكل شهر 2026–2027.
    func testGridColumnsMatchRealWeekdayForManyMonths() {
        let cal = AccountCalendarMath.gregorian
        for year in [2026, 2027] {
            for month in 1...12 {
                let cursor = noon(year, month, 15)
                let grid = AccountCalendarMath.monthGrid(for: cursor, calendar: cal)
                XCTAssertEqual(grid.count % 7, 0, "\(year)-\(month)")
                for (i, day) in grid.enumerated() {
                    let realWeekday = ref.component(.weekday, from: day)   // 1 = الأحد (مرجع مستقل)
                    XCTAssertEqual(i % 7 + 1, realWeekday, "عمود \(year)-\(month) اليوم \(ref.component(.day, from: day))")
                }
                let first = noon(year, month, 1)
                XCTAssertTrue(grid.contains { ref.isDate($0, inSameDayAs: first) }, "\(year)-\(month)")
            }
        }
    }

    func testWeekViewStartsOnSunday() {
        let days = AccountCalendarMath.weekDays(around: noon(2026, 10, 14), calendar: AccountCalendarMath.gregorian)
        XCTAssertEqual(days.count, 7)
        XCTAssertEqual(ref.component(.weekday, from: days[0]), 1)
        XCTAssertEqual(ref.component(.weekday, from: days[3]), 4) // الأربعاء
    }

    func testHijriDateOfOctober14_2026() {
        XCTAssertEqual(AccountCalendarMath.hijriMonthYear(noon(2026, 10, 14)), "جمادى الأولى 1448 هـ")
        var c = Calendar(identifier: .islamicUmmAlQura)
        c.timeZone = ref.timeZone
        let p = c.dateComponents([.year, .month, .day], from: noon(2026, 10, 14))
        XCTAssertEqual([p.day, p.month, p.year], [3, 5, 1448])
    }
}

private extension Calendar {
    func withSunday() -> Calendar { var c = self; c.firstWeekday = 1; return c }
}
