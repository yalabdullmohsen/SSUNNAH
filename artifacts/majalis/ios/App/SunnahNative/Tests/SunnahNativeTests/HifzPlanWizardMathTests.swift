import XCTest
@testable import SunnahNative

/// معالج خطة الحفظ: حدود الأجزاء من فهرس المصحف (الصيغة التقريبية تخطئ الجزأين 7 و11)، وتعبئة التعديل من الخطة المحفوظة.
final class HifzPlanWizardMathTests: XCTestCase {
    /// بدايات الأجزاء كما يصدّرها export-ios-data.mjs من quran-v2 (أول صفحة فيها آية من الجزء).
    private let starts = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
                          402, 422, 442, 462, 482, 502, 522, 542, 562, 582]

    func testJuzBoundsFollowTheIndex() {
        XCTAssertEqual(HifzPlanWizardMath.juzStart(7, starts), 121)
        XCTAssertEqual(HifzPlanWizardMath.juzEnd(6, starts), 120)
        XCTAssertEqual(HifzPlanWizardMath.juzStart(11, starts), 201)
        XCTAssertEqual(HifzPlanWizardMath.juzEnd(10, starts), 200, "الصفحة 201 للجزء 11 لا للعاشر")
        XCTAssertEqual(HifzPlanWizardMath.juzStart(30, starts), 582)
        XCTAssertEqual(HifzPlanWizardMath.juzEnd(30, starts), 604)
        for j in 1...30 { XCTAssertEqual(HifzPlanWizardMath.juzStart(j, starts)...HifzPlanWizardMath.juzEnd(j, starts), HifzProgress.juzPages(j, juzStart: starts)) }
    }

    func testFallbackWithoutIndexKeepsOldFormula() {
        XCTAssertEqual(HifzPlanWizardMath.juzStart(2, []), 22)
        XCTAssertEqual(HifzPlanWizardMath.juzEnd(30, []), 604)
    }

    func testJuzOfPage() {
        XCTAssertEqual(HifzPlanWizardMath.juz(ofPage: 121, starts), 7)
        XCTAssertEqual(HifzPlanWizardMath.juz(ofPage: 120, starts), 6)
        XCTAssertEqual(HifzPlanWizardMath.juz(ofPage: 604, starts), 30)
        XCTAssertEqual(HifzPlanWizardMath.juz(ofPage: 1, starts), 1)
    }

    private func plan(_ start: HifzPlanMath.Start, _ first: Int, _ last: Int, lines: Int, days: Set<Int>) -> HifzPlan {
        HifzPlan(start: start, firstPage: first, lastPage: last, linesPerDay: lines, weekdays: days, startDate: Date(timeIntervalSince1970: 0), reminderHour: nil)
    }

    func testEditSeedsFromSavedPlan() {
        let s = HifzPlanWizardMath.seed(plan(.nas, 582, 604, lines: 5, days: [7, 2]), juzStarts: starts)
        XCTAssertEqual(s.goal, .juzAmma)
        XCTAssertEqual(s.startKind, .nas)
        XCTAssertEqual(s.lines, 5)
        XCTAssertEqual(s.weekdays, [7, 2])

        let r = HifzPlanWizardMath.seed(plan(.resume(page: 130), 121, 200, lines: 7, days: []), juzStarts: starts)
        XCTAssertEqual(r.goal, .juzRange)
        XCTAssertEqual(r.juzFrom, 7)
        XCTAssertEqual(r.juzTo, 10)
        XCTAssertEqual(r.startKind, .resume)
        XCTAssertEqual(r.resumePage, 130)
        XCTAssertEqual(r.lines, 7, "وتيرة مخصّصة من تعديل التاريخ تبقى كما هي")

        XCTAssertEqual(HifzPlanWizardMath.seed(plan(.fatiha, 1, 604, lines: 15, days: []), juzStarts: starts).goal, .whole)
    }

    func testNewPlanDefaults() {
        let s = HifzPlanWizardMath.seed(nil, juzStarts: starts)
        XCTAssertEqual(s, .init(goal: .whole, juzFrom: 1, juzTo: 30, startKind: .fatiha, resumePage: 1, lines: 15, weekdays: []))
    }
}
