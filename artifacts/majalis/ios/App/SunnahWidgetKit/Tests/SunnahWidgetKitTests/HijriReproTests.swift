import XCTest
@testable import SunnahWidgetKit

/// إعادة إنتاج أخطاء المعرض: الخميس 8 أكتوبر 2026 بتوقيت الكويت.
final class HijriReproTests: XCTestCase {
    private let kuwait = TimeZone(identifier: "Asia/Kuwait")!

    private func kuwaitDate(_ y: Int, _ m: Int, _ d: Int, _ hh: Int = 12, _ mm: Int = 0) -> Date {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = kuwait
        return c.date(from: DateComponents(year: y, month: m, day: d, hour: hh, minute: mm))!
    }

    func testHijriDateOnReferenceDay() {
        let h = HijriCalendar.date(kuwaitDate(2026, 10, 8), timeZone: kuwait)
        XCTAssertEqual(h, HijriDate(year: 1448, month: 4, day: 27))
        XCTAssertEqual(HijriCalendar.display(h), "27 ربيع الآخر 1448")
    }

    func testAshuraIsAboutEightMonthsAwayNotEighteenDays() {
        let days = HijriCalendar.daysUntil(month: 1, day: 10, from: kuwaitDate(2026, 10, 8), timeZone: kuwait)
        XCTAssertNotNil(days)
        XCTAssertTrue((240...260).contains(days ?? 0), "days=\(days ?? -1)")
    }

    func testRamadanCountdownIsPositiveAndBounded() {
        let days = HijriCalendar.daysUntil(month: 9, day: 1, from: kuwaitDate(2026, 10, 8), timeZone: kuwait)
        XCTAssertTrue((1...400).contains(days ?? 0))
    }

    func testDaysUntilTodayIsZero() {
        let now = kuwaitDate(2026, 10, 8)
        XCTAssertEqual(HijriCalendar.daysUntil(month: 4, day: 27, from: now, timeZone: kuwait), 0)
    }
}
