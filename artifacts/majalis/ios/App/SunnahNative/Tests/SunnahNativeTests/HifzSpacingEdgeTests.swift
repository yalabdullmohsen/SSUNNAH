import XCTest
@testable import SunnahNative

/// المراجعة المتباعدة في خطة الحفظ: فواصل القوة، وموعد الاستحقاق، وحدود المراجعة البعيدة، وعدّ أيام الحفظ.
final class HifzSpacingEdgeTests: XCTestCase {
    private var cal: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "UTC")!; return c }
    private func d(_ m: Int, _ day: Int, _ h: Int = 0) -> Date { cal.date(from: DateComponents(year: 2026, month: m, day: day, hour: h))! }
    private func rec(_ p: Int, mem: Date, last: Date? = nil, s: Int) -> HifzPlanMath.PageRecord {
        HifzPlanMath.PageRecord(page: p, memorizedOn: mem, lastReviewed: last, strength: s)
    }

    func testIntervalDoublesAndClampsStrength() {
        XCTAssertEqual((0...5).map { HifzPlanMath.interval(strength: $0) }, [1, 2, 4, 8, 16, 32])
        XCTAssertEqual(HifzPlanMath.interval(strength: -3), 1)
        XCTAssertEqual(HifzPlanMath.interval(strength: 99), 32)
    }

    func testDueDateCountsFromStartOfLastReviewOrMemorizedDay() {
        XCTAssertEqual(HifzPlanMath.dueDate(rec(1, mem: d(3, 1, 22), s: 2), calendar: cal), d(3, 5), "تاريخ الحفظ عند غياب المراجعة، من بداية اليوم")
        XCTAssertEqual(HifzPlanMath.dueDate(rec(1, mem: d(1, 1), last: d(3, 10, 23), s: 0), calendar: cal), d(3, 11))
    }

    func testFarReviewIncludesDueTodayAtAnyHour() {
        let r = rec(7, mem: d(3, 1), last: d(3, 9, 23), s: 0)   // مستحقة 3-10
        XCTAssertEqual(HifzPlanMath.farReview([r], today: d(3, 10, 0), near: [], calendar: cal), [7])
        XCTAssertEqual(HifzPlanMath.farReview([r], today: d(3, 10, 23), near: [], calendar: cal), [7])
        XCTAssertEqual(HifzPlanMath.farReview([r], today: d(3, 9, 23), near: [], calendar: cal), [])
    }

    func testFarReviewTiesBreakByPageAndLimitIsBounded() {
        let rs = [rec(9, mem: d(1, 1), s: 0), rec(2, mem: d(1, 1), s: 0), rec(5, mem: d(1, 1), s: 0)]
        XCTAssertEqual(HifzPlanMath.farReview(rs, today: d(3, 1), near: [], calendar: cal), [2, 5, 9])
        XCTAssertEqual(HifzPlanMath.farReview(rs, today: d(3, 1), near: [], limit: 0, calendar: cal), [])
        XCTAssertEqual(HifzPlanMath.farReview(rs, today: d(3, 1), near: [], limit: -2, calendar: cal), [])
    }

    func testStrengthAfterReviewStaysInRange() {
        XCTAssertEqual(HifzPlanMath.strength(after: 5, recalled: true), 5)
        XCTAssertEqual(HifzPlanMath.strength(after: 1, recalled: false), 0)
        XCTAssertEqual(HifzPlanMath.strength(after: 4, recalled: false), 2)
    }

    func testStudyDayEmptySelectionMeansEveryDay() {
        // 2026-03-06 جمعة (6)، و2026-03-07 سبت (7).
        XCTAssertTrue(HifzPlanMath.isStudyDay(d(3, 6), weekdays: [], calendar: cal))
        XCTAssertTrue(HifzPlanMath.isStudyDay(d(3, 6), weekdays: [6], calendar: cal))
        XCTAssertFalse(HifzPlanMath.isStudyDay(d(3, 7), weekdays: [6], calendar: cal))
    }

    func testStudyDaysInclusiveAndEmptyWhenReversed() {
        XCTAssertEqual(HifzPlanMath.studyDays(from: d(3, 1, 20), to: d(3, 7, 1), weekdays: [], calendar: cal), 7)
        XCTAssertEqual(HifzPlanMath.studyDays(from: d(3, 1), to: d(3, 14), weekdays: [6], calendar: cal), 2, "جمعتان: 6 و13")
        XCTAssertEqual(HifzPlanMath.studyDays(from: d(3, 5), to: d(3, 5), weekdays: [], calendar: cal), 1)
        XCTAssertEqual(HifzPlanMath.studyDays(from: d(3, 5), to: d(3, 4), weekdays: [], calendar: cal), 0)
    }
}
