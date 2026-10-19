import XCTest
@testable import SunnahNative

final class HifzPlanMathTests: XCTestCase {
    private var cal: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "UTC")!; return c }
    private func d(_ y: Int, _ m: Int, _ day: Int) -> Date { cal.date(from: DateComponents(year: y, month: m, day: day))! }
    private let all: Set<Int> = []

    func testSequenceDirections() {
        XCTAssertEqual(HifzPlanMath.pageSequence(start: .fatiha, range: 1...3), [1, 2, 3])
        XCTAssertEqual(HifzPlanMath.pageSequence(start: .nas, range: 602...604), [604, 603, 602])
        XCTAssertEqual(HifzPlanMath.pageSequence(start: .resume(page: 600)), [600, 601, 602, 603, 604])
        XCTAssertEqual(HifzPlanMath.pageSequence(start: .resume(page: 9999), range: 1...5), [5])
        XCTAssertTrue(HifzPlanMath.pageSequence(start: .fatiha, range: 700...800).isEmpty)
    }

    func testFinishDateFullQuranOneLinePerDayPace() {
        // 604 صفحة × 15 = 9060 سطرًا؛ صفحة يوميًا (15 سطرًا) = 604 يومًا
        let total = HifzPlanMath.totalLines(pages: 604)
        XCTAssertEqual(total, 9060)
        XCTAssertEqual(HifzPlanMath.studyDaysNeeded(totalLines: total, linesPerDay: 15), 604)
        let f = HifzPlanMath.finishDate(start: d(2026, 1, 1), totalLines: total, linesPerDay: 15, weekdays: all, calendar: cal)
        XCTAssertEqual(f, cal.date(byAdding: .day, value: 603, to: d(2026, 1, 1)))
    }

    func testFinishDateSkipsNonStudyDays() {
        // 2026-01-05 اثنين؛ أيام الحفظ: الاثنين(2) والخميس(5)؛ 3 أيام حفظ = الاثنين 5، الخميس 8، الاثنين 12
        let f = HifzPlanMath.finishDate(start: d(2026, 1, 5), totalLines: 45, linesPerDay: 15, weekdays: [2, 5], calendar: cal)
        XCTAssertEqual(f, d(2026, 1, 12))
        // البداية يوم غير حفظ تنتقل لأول يوم حفظ
        let g = HifzPlanMath.finishDate(start: d(2026, 1, 6), totalLines: 15, linesPerDay: 15, weekdays: [2, 5], calendar: cal)
        XCTAssertEqual(g, d(2026, 1, 8))
    }

    func testReversePaceCeilsAndMatchesForwardDate() {
        let total = 300
        let end = d(2026, 2, 28)
        let pace = HifzPlanMath.linesPerDay(toFinishBy: end, start: d(2026, 1, 1), totalLines: total, weekdays: all, calendar: cal)
        XCTAssertEqual(pace, 6) // 59 يومًا → ceil(300/59) = 6
        let back = HifzPlanMath.finishDate(start: d(2026, 1, 1), totalLines: total, linesPerDay: pace!, weekdays: all, calendar: cal)!
        XCTAssertLessThanOrEqual(back, end)
        XCTAssertNil(HifzPlanMath.linesPerDay(toFinishBy: d(2025, 12, 1), start: d(2026, 1, 1), totalLines: total, weekdays: all, calendar: cal))
    }

    func testProgressAheadBehindOnTrack() {
        func p(_ done: Int) -> HifzPlanMath.Progress {
            HifzPlanMath.progress(start: d(2026, 1, 1), today: d(2026, 1, 10), totalLines: 1000, linesPerDay: 10, doneLines: done, weekdays: all, calendar: cal)
        }
        XCTAssertEqual(p(100).expectedLines, 100)
        XCTAssertEqual(p(100).state, .onTrack)
        XCTAssertEqual(p(150).state, .ahead); XCTAssertEqual(p(150).deltaDays, 5)
        XCTAssertEqual(p(60).state, .behind); XCTAssertEqual(p(60).deltaDays, -4)
        let before = HifzPlanMath.progress(start: d(2026, 2, 1), today: d(2026, 1, 10), totalLines: 100, linesPerDay: 10, doneLines: 0, weekdays: all, calendar: cal)
        XCTAssertEqual(before.expectedLines, 0)
    }

    func testAdjustedPaceAfterFallingBehind() {
        let adj = HifzPlanMath.adjustedLinesPerDay(today: d(2026, 1, 10), end: d(2026, 1, 19), remainingLines: 940, weekdays: all, calendar: cal)
        XCTAssertEqual(adj, 94) // 10 أيام شاملة اليوم
    }

    private func rec(_ page: Int, mem: Date, last: Date? = nil, s: Int = 0) -> HifzPlanMath.PageRecord {
        .init(page: page, memorizedOn: mem, lastReviewed: last, strength: s)
    }

    func testNearReviewTakesLatestMemorizedBounded() {
        let rs = (1...12).map { rec($0, mem: d(2026, 1, $0)) }
        XCTAssertEqual(HifzPlanMath.nearReview(rs, count: 7), [12, 11, 10, 9, 8, 7, 6])
        XCTAssertEqual(HifzPlanMath.nearReview(rs, count: 2).count, 5)
        XCTAssertEqual(HifzPlanMath.nearReview(rs, count: 50).count, 10)
    }

    func testFarReviewDueOrderedAndExcludesNear() {
        let today = d(2026, 3, 1)
        let rs = [
            rec(1, mem: d(2026, 1, 1), last: d(2026, 2, 1), s: 3),   // استحقاق 2026-02-09 → مستحقة
            rec(2, mem: d(2026, 1, 1), last: d(2026, 2, 28), s: 5),  // استحقاق بعد 32 يومًا → لا
            rec(3, mem: d(2026, 1, 1), last: nil, s: 0),             // استحقاق 2026-01-02 → الأقدم
            rec(4, mem: d(2026, 1, 1), last: d(2026, 2, 1), s: 3),   // ضمن القريبة → مستثناة
        ]
        XCTAssertEqual(HifzPlanMath.farReview(rs, today: today, near: [4], calendar: cal), [3, 1])
        XCTAssertEqual(HifzPlanMath.farReview(rs, today: today, near: [4], limit: 1, calendar: cal), [3])
    }

    func testStrengthTransitionsAndDailyWird() {
        XCTAssertEqual(HifzPlanMath.strength(after: 5, recalled: true), 5)
        XCTAssertEqual(HifzPlanMath.strength(after: 1, recalled: false), 0)
        XCTAssertEqual(HifzPlanMath.strength(after: 3, recalled: false), 1)
        let rs = [rec(1, mem: d(2026, 1, 1)), rec(2, mem: d(2026, 1, 2))]
        let w = HifzPlanMath.dailyWird(sequence: [1, 2, 3, 4, 5], memorized: [1, 2], linesPerDay: 30, records: rs, today: d(2026, 3, 1), calendar: cal)
        XCTAssertEqual(w.newPages, [3, 4]) // 30 سطرًا = صفحتان
        XCTAssertEqual(Set(w.nearPages), [1, 2])
        XCTAssertTrue(w.farPages.isEmpty)
    }

    func testPlanStateMarksAndProgress() {
        var cal = Calendar(identifier: .gregorian); cal.timeZone = TimeZone(secondsFromGMT: 0)!
        let day0 = cal.date(from: DateComponents(year: 2026, month: 1, day: 1))!
        let plan = HifzPlan(start: .fatiha, firstPage: 1, lastPage: 10, linesPerDay: 15, weekdays: [], startDate: day0, reminderHour: nil)
        var st = HifzPlanState(plan: plan)
        XCTAssertEqual(st.remainingPages, 10)
        st.markNew(page: 1, today: day0); st.markNew(page: 1, today: day0)
        XCTAssertEqual(st.doneInPlan, 1)
        st.markReview(page: 1, recalled: true, today: day0)
        XCTAssertEqual(st.pages[0].strength, 1)
        let day3 = cal.date(byAdding: .day, value: 3, to: day0)!
        XCTAssertEqual(st.progress(today: day3, calendar: cal)?.state, .behind)
        XCTAssertEqual(st.expectedFinish(today: day3, calendar: cal), cal.date(byAdding: .day, value: 11, to: day0))
        let data = try! JSONEncoder().encode(st)
        XCTAssertEqual(try! JSONDecoder().decode(HifzPlanState.self, from: data), st)
    }
}
