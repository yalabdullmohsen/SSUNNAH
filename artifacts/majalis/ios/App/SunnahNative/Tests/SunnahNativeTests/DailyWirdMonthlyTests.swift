import XCTest
@testable import SunnahNative

/// «هذا الشهر» في الورد اليومي يبدأ من الصفر مع كل شهر جديد، ولا يمسّ المجموع الكلي ولا الختمة.
final class DailyWirdMonthlyTests: XCTestCase {
    func testMonthlyResetsOnFirstAddOfNewMonth() {
        var s = WirdState(); s.pagesPerDay = 5
        s.add(5, today: "2026-10-30", yesterday: "2026-10-29")
        s.add(3, today: "2026-10-31", yesterday: "2026-10-30")
        XCTAssertEqual(s.monthly(today: "2026-10-31"), 8)
        s.add(2, today: "2026-11-01", yesterday: "2026-10-31")
        XCTAssertEqual(s.monthly(today: "2026-11-01"), 2)
        XCTAssertEqual(s.totalPagesEver, 10)
    }

    func testShowsZeroInNewMonthBeforeAnyReading() {
        var s = WirdState()
        s.add(4, today: "2026-10-31", yesterday: "2026-10-30")
        XCTAssertEqual(s.monthly(today: "2026-11-01"), 0)
        XCTAssertEqual(s.monthly(today: "2026-10-31"), 4)
    }

    func testSameMonthNextYearIsANewMonth() {
        var s = WirdState()
        s.add(4, today: "2025-11-10", yesterday: "2025-11-09")
        s.add(1, today: "2026-11-10", yesterday: "2026-11-09")
        XCTAssertEqual(s.monthly(today: "2026-11-10"), 1)
    }

    func testOldSavedStateWithoutMonthKeyUsesLastDate() throws {
        let old = #"{"pagesPerDay":5,"completedToday":3,"lastDate":"2026-09-30","monthlyTotal":120,"streak":0,"weeklyLogs":{},"totalPagesEver":120}"#
        var s = try JSONDecoder().decode(WirdState.self, from: Data(old.utf8))
        XCTAssertEqual(s.monthly(today: "2026-09-30"), 120)
        XCTAssertEqual(s.monthly(today: "2026-10-01"), 0)
        s.add(2, today: "2026-10-01", yesterday: "2026-09-30")
        XCTAssertEqual(s.monthly(today: "2026-10-01"), 2)
        XCTAssertEqual(s.totalPagesEver, 122)
    }

    func testResetTodayStillSubtractsWithinMonth() {
        var s = WirdState()
        s.add(5, today: "2026-11-02", yesterday: "2026-11-01")
        s.add(3, today: "2026-11-03", yesterday: "2026-11-02")
        s.resetToday(today: "2026-11-03")
        XCTAssertEqual(s.monthly(today: "2026-11-03"), 5)
    }
}
