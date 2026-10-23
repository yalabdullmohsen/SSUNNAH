import XCTest
@testable import SunnahNative

/// مراجعة صفحة (`markReviewed`) ونافذة أيام النشاط (بلا تكرار، مرتّبة، بسقف `maxDays`) وحدود قوة الحفظ.
final class HifzReviewAndActiveDaysTests: XCTestCase {
    private let cal: Calendar = { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "UTC")!; return c }()
    /// 2026-01-01 12:00Z + n يوم.
    private func day(_ n: Int) -> Date { Date(timeIntervalSince1970: 1_767_268_800 + Double(n) * 86_400) }

    func testReviewTurnsReviewPageIntoMemorizedAndStrengthens() {
        var p = HifzProgress()
        p.set(.review, pages: 5...5, date: day(0), calendar: cal)
        XCTAssertEqual(p.entry(5).strength, 2)
        p.markReviewed(page: 5, date: day(3), calendar: cal)
        XCTAssertEqual(p.state(5), .memorized)
        XCTAssertEqual(p.entry(5).strength, 3)
        XCTAssertEqual(p.entry(5).lastReview, day(3))
        XCTAssertEqual(p.activeDays, ["2026-01-01", "2026-01-04"])
    }

    func testStrengthCapsAtFive() {
        var p = HifzProgress()
        p.set(.memorized, pages: 1...1, date: day(0), calendar: cal)
        for i in 1...5 { p.markReviewed(page: 1, date: day(i), calendar: cal) }
        XCTAssertEqual(p.entry(1).strength, 5)
    }

    func testReviewIgnoresUnmemorizedAndOutOfRangePages() {
        var p = HifzProgress()
        p.markReviewed(page: 10, date: day(0), calendar: cal)
        p.markReviewed(page: 0, date: day(0), calendar: cal)
        p.markReviewed(page: 605, date: day(0), calendar: cal)
        XCTAssertEqual(p, HifzProgress(), "لا مدخل ولا يوم نشاط")
    }

    func testSettingMemorizedKeepsEarlierReviewDateButPartialHasNone() {
        var p = HifzProgress()
        p.set(.memorized, pages: 1...2, date: day(0), calendar: cal)
        p.set(.memorized, pages: 1...3, date: day(5), calendar: cal)
        XCTAssertEqual(p.entry(1).lastReview, day(0))
        XCTAssertEqual(p.entry(3).lastReview, day(5))
        p.set(.partial, pages: 7...7, date: day(5), calendar: cal)
        XCTAssertNil(p.entry(7).lastReview)
        XCTAssertEqual(p.entry(7).strength, 1)
    }

    func testClearingDoesNotCountAsActivity() {
        var p = HifzProgress()
        p.set(.none, pages: 1...10, date: day(0), calendar: cal)
        XCTAssertTrue(p.activeDays.isEmpty)
    }

    func testActiveDaysAreUniqueSortedAndCapped() {
        var p = HifzProgress()
        p.set(.partial, pages: 1...1, date: day(2), calendar: cal)
        p.set(.partial, pages: 2...2, date: day(0), calendar: cal)
        p.set(.partial, pages: 3...3, date: day(2), calendar: cal)
        XCTAssertEqual(p.activeDays, ["2026-01-01", "2026-01-03"])

        for i in 0...HifzProgress.maxDays { p.set(.partial, pages: 1...1, date: day(i), calendar: cal) }
        XCTAssertEqual(p.activeDays.count, HifzProgress.maxDays)
        XCTAssertEqual(p.activeDays.first, "2026-01-02", "يُسقط الأقدم أولًا")
        XCTAssertEqual(p.activeDays, p.activeDays.sorted())
    }

    func testEntryStrengthIsClamped() {
        XCTAssertEqual(HifzPageEntry(state: .memorized, strength: 9).strength, 5)
        XCTAssertEqual(HifzPageEntry(state: .memorized, strength: -3).strength, 0)
        XCTAssertEqual(HifzPageEntry(state: .review).strength, 2)
    }
}
