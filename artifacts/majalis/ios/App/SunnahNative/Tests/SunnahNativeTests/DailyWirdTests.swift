import XCTest
@testable import SunnahNative

final class DailyWirdTests: XCTestCase {
    func testStreakAndKhatma() {
        var s = WirdState(); s.pagesPerDay = 5
        s.add(5, today: "2026-10-11", yesterday: "2026-10-10")
        XCTAssertEqual(s.streak, 1)
        s.add(5, today: "2026-10-12", yesterday: "2026-10-11")
        XCTAssertEqual(s.streak, 2)
        s.add(1, today: "2026-10-12", yesterday: "2026-10-11")
        XCTAssertEqual(s.streak, 2, "لا زيادة ثانية في اليوم نفسه")
        s.resetToday(today: "2026-10-12")
        XCTAssertEqual(s.totalPagesEver, 5)
        s.totalPagesEver = 604 + 10
        XCTAssertEqual(s.khatmas, 1); XCTAssertEqual(s.pagesInKhatma, 10)
        XCTAssertEqual(s.daysToKhatma, 119)
    }
}
