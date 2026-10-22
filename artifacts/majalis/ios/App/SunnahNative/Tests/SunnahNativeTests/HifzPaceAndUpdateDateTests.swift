import XCTest
@testable import SunnahNative

/// الوتيرة العكسية لخطة الحفظ (`paceToFinish`) وقراءة تواريخ المستجدات (`AccountUpdates.parseDate`).
final class HifzPaceAndUpdateDateTests: XCTestCase {
    private var cal: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "UTC")!; return c }
    private var day0: Date { cal.date(from: DateComponents(year: 2026, month: 1, day: 1))! } // خميس
    private func day(_ n: Int) -> Date { cal.date(byAdding: .day, value: n, to: day0)! }
    private func state(pages: Int = 10, weekdays: Set<Int> = []) -> HifzPlanState {
        HifzPlanState(plan: HifzPlan(start: .fatiha, firstPage: 1, lastPage: pages, linesPerDay: 15, weekdays: weekdays, startDate: day0, reminderHour: nil))
    }

    // MARK: paceToFinish

    func testNoPlanHasNoPace() {
        XCTAssertNil(HifzPlanState(plan: nil).paceToFinish(by: day(9), today: day0, calendar: cal))
    }

    func testPaceSpreadsRemainingLinesOverInclusiveDays() {
        // 10 صفحات = 150 سطرًا.
        XCTAssertEqual(state().paceToFinish(by: day(9), today: day0, calendar: cal), 15)
        XCTAssertEqual(state().paceToFinish(by: day(4), today: day0, calendar: cal), 30)
        XCTAssertEqual(state().paceToFinish(by: day0, today: day0, calendar: cal), 150, "اليوم نفسه يُحسب")
    }

    func testPaceRoundsUpAndUsesOnlyRemainingPages() {
        var st = state()
        for p in 1...5 { st.markNew(page: p, today: day0) }
        // المتبقي 5 صفحات = 75 سطرًا على 10 أيام → 7.5 تُقرَّب إلى 8.
        XCTAssertEqual(st.paceToFinish(by: day(9), today: day0, calendar: cal), 8)
    }

    func testPaceCountsFromPlanStartWhenTodayIsEarlier() {
        XCTAssertEqual(state().paceToFinish(by: day(9), today: day(-10), calendar: cal), 15)
    }

    func testPaceCountsOnlyChosenWeekdays() {
        // الجمعة (6) فقط: 2 و9 و16 و23 و30 يناير = 5 أيام → 150 ÷ 5.
        XCTAssertEqual(state(weekdays: [6]).paceToFinish(by: day(29), today: day0, calendar: cal), 30)
    }

    func testImpossibleOrFinishedPlanHasNoPace() {
        XCTAssertNil(state().paceToFinish(by: day(-1), today: day0, calendar: cal), "تاريخ ختم ماضٍ")
        var done = state(pages: 2)
        done.markNew(page: 1, today: day0); done.markNew(page: 2, today: day0)
        XCTAssertNil(done.paceToFinish(by: day(9), today: day0, calendar: cal), "لا متبقي")
    }

    // MARK: AccountUpdates.parseDate

    func testParseDateAcceptsFractionalPlainOffsetAndDateOnly() throws {
        let frac = try XCTUnwrap(AccountUpdates.parseDate("2026-10-22T10:15:30.123Z"))
        XCTAssertEqual(frac.timeIntervalSince1970, 1_792_664_130.123, accuracy: 0.001)
        XCTAssertEqual(AccountUpdates.parseDate("2026-10-22T10:15:30Z")?.timeIntervalSince1970, 1_792_664_130)
        XCTAssertEqual(AccountUpdates.parseDate("2026-10-22T10:15:30+03:00")?.timeIntervalSince1970, 1_792_653_330)
        XCTAssertEqual(AccountUpdates.parseDate("2026-10-22")?.timeIntervalSince1970, 1_792_627_200)
    }

    func testParseDateFallsBackToDayPartForNonISOTimestamps() {
        // صيغة Postgres بمسافة بدل T: يُؤخذ اليوم فقط.
        XCTAssertEqual(AccountUpdates.parseDate("2026-10-22 10:15:30+00")?.timeIntervalSince1970, 1_792_627_200)
    }

    func testParseDateRejectsGarbage() {
        XCTAssertNil(AccountUpdates.parseDate(""))
        XCTAssertNil(AccountUpdates.parseDate("غير معروف"))
    }
}
