import XCTest
@testable import SunnahNative

/// سلسلة الورد اليومي: إكمال الهدف على دفعات، والانقطاع، وعدم الاحتساب مرتين في اليوم، وقراءة البيانات القديمة.
final class DailyWirdStreakTests: XCTestCase {
    private func state(goal: Int = 5) -> WirdState { var s = WirdState(); s.pagesPerDay = goal; return s }

    func testGoalCompletedInPartsStillExtendsStreak() {
        var s = state()
        s.add(5, today: "D1", yesterday: "D0")
        s.add(2, today: "D2", yesterday: "D1")
        XCTAssertEqual(s.streak, 1, "الهدف لم يكتمل بعد")
        s.add(3, today: "D2", yesterday: "D1")
        XCTAssertEqual(s.streak, 2)
    }

    func testGapRestartsStreakEvenWhenCompletedInParts() {
        var s = state()
        s.add(5, today: "D1", yesterday: "D0")
        s.add(5, today: "D2", yesterday: "D1")
        XCTAssertEqual(s.streak, 2)
        s.add(2, today: "D5", yesterday: "D4")
        s.add(3, today: "D5", yesterday: "D4")
        XCTAssertEqual(s.streak, 1, "انقطاع يومين يبدأ السلسلة من جديد")
    }

    func testPartialYesterdayDoesNotCount() {
        var s = state()
        s.add(5, today: "D1", yesterday: "D0")
        s.add(4, today: "D2", yesterday: "D1")
        s.add(5, today: "D3", yesterday: "D2")
        XCTAssertEqual(s.streak, 1)
    }

    func testResetAndRecompleteSameDayCountsOnce() {
        var s = state()
        s.add(5, today: "D1", yesterday: "D0")
        s.add(5, today: "D2", yesterday: "D1")
        s.resetToday(today: "D2")
        s.add(5, today: "D2", yesterday: "D1")
        XCTAssertEqual(s.streak, 2)
        XCTAssertEqual(s.todayCount("D2"), 5)
    }

    func testOldSavedStateWithoutStreakDayStillDecodes() throws {
        let json = #"{"pagesPerDay":5,"completedToday":5,"lastDate":"D1","monthlyTotal":5,"streak":3,"weeklyLogs":{"D1":5},"totalPagesEver":5}"#
        var s = try JSONDecoder().decode(WirdState.self, from: Data(json.utf8))
        XCTAssertNil(s.streakDay)
        XCTAssertEqual(s.streak, 3)
        s.add(5, today: "D2", yesterday: "D1")
        XCTAssertEqual(s.streak, 4)
    }

    func testStreakMessages() {
        XCTAssertEqual(WirdState.streakMessage(0), "")
        XCTAssertFalse(WirdState.streakMessage(1).isEmpty)
        XCTAssertEqual(WirdState.streakMessage(2), "", "الشاشة لا تعرض سطرًا فارغًا لهذه القيمة")
        for s in [3, 7, 14, 30, 365] { XCTAssertFalse(WirdState.streakMessage(s).isEmpty, "\(s)") }
    }

    func testZeroGoalHasNoKhatmaEstimate() {
        XCTAssertNil(state(goal: 0).daysToKhatma)
        XCTAssertEqual(state(goal: 604).daysToKhatma, 1)
    }
}
