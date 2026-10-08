import XCTest
@testable import SunnahWidgetKit

final class WidgetTextBudgetTests: XCTestCase {
    func testLongestNamesFitBudget() {
        let names = ["الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"] + HijriCalendar.monthNamesAr
        for n in names {
            XCTAssertTrue(WidgetTextBudget.fits(n, maxChars: WidgetTextBudget.name), n)
        }
        XCTAssertEqual(HijriCalendar.monthNamesAr.map(\.count).max(), 12) // جمادى الآخرة
    }

    func testHijriShortHasNoYearAndLatinDigits() {
        let s = HijriCalendar.short(HijriDate(year: 1448, month: 4, day: 27))
        XCTAssertEqual(s, "27 ربيع الآخر")
    }

    func testProgressClamped() {
        let a = Date(timeIntervalSince1970: 1000), b = Date(timeIntervalSince1970: 2000)
        XCTAssertEqual(WidgetTextBudget.progress(now: a.addingTimeInterval(-5), from: a, to: b), 0)
        XCTAssertEqual(WidgetTextBudget.progress(now: a.addingTimeInterval(500), from: a, to: b), 0.5)
        XCTAssertEqual(WidgetTextBudget.progress(now: b.addingTimeInterval(5), from: a, to: b), 1)
        XCTAssertEqual(WidgetTextBudget.progress(now: a, from: b, to: a), 0)
    }

    func testWindowBoundaryClockModes() {
        // دخول الوقت → عدّ تصاعدي؛ +30 د → تنازلي للتالية.
        let adhan = Date(timeIntervalSince1970: 10_000)
        let next = adhan.addingTimeInterval(4 * 3600)
        XCTAssertEqual(LiveClock.resolve(now: adhan.addingTimeInterval(29 * 60 + 59), elapsedStart: adhan, nextDate: next, nextHasStarted: false), .countUp(since: adhan))
        XCTAssertEqual(LiveClock.resolve(now: adhan.addingTimeInterval(30 * 60), elapsedStart: nil, nextDate: next, nextHasStarted: false), .countDown(until: next))
    }
}
