import XCTest
@testable import SunnahNative

/// درس بأكثر من يوم في التقويم: «الثلاثاء والخميس» يظهر في اليومين، وما ليس أسماء أيام فقط لا يُخمَّن (مطابق لـ weekdaysOf في الويب).
final class CalendarMultiDayTests: XCTestCase {
    private var utc: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "UTC")!; c.firstWeekday = 1; return c }
    private func day(_ d: Int) -> Date { utc.date(from: DateComponents(year: 2026, month: 8, day: d, hour: 12))! }

    func testWeekdaysParsesSingleAndJoinedDays() {
        XCTAssertEqual(AccountCalendarMath.weekdays("الاثنين"), [1])
        XCTAssertEqual(AccountCalendarMath.weekdays(" الإثنين "), [1])
        XCTAssertEqual(AccountCalendarMath.weekdays("الثلاثاء والخميس"), [2, 4])
        XCTAssertEqual(AccountCalendarMath.weekdays("الاثنين والخميس"), [1, 4])
        XCTAssertEqual(AccountCalendarMath.weekdays("الثلاثاء و الخميس"), [2, 4])
        XCTAssertEqual(AccountCalendarMath.weekdays("الأحد، الثلاثاء"), [0, 2])
    }

    func testUnclearDayTextIsNotGuessed() {
        for s in ["من الأحد إلى الخميس يومياً", "طوال الأسبوع", "يومياً على فترتين", "غير محدد", "8 يوليو 2026", ""] {
            XCTAssertEqual(AccountCalendarMath.weekdays(s), [], s)
        }
    }

    func testJoinedDaysLessonAppearsOnEachDay() {
        // 2026-08-16 أحد، 18 ثلاثاء، 20 خميس.
        let multi = AccountCalendarEvent(lesson: AccountLesson(id: "m", title: "النحو", dayOfWeek: "الثلاثاء والخميس"))
        let range = AccountCalendarEvent(lesson: AccountLesson(id: "r", title: "عمدة", dayOfWeek: "من الأحد إلى الخميس يومياً"))
        XCTAssertEqual(AccountCalendarMath.events(on: day(18), in: [multi, range], calendar: utc).map(\.id), ["m"])
        XCTAssertEqual(AccountCalendarMath.events(on: day(20), in: [multi, range], calendar: utc).map(\.id), ["m"])
        XCTAssertEqual(AccountCalendarMath.events(on: day(16), in: [multi, range], calendar: utc).map(\.id), [])
    }
}
