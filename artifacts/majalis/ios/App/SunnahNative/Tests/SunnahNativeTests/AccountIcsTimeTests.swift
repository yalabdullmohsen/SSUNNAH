import XCTest
@testable import SunnahNative

/// وقت الدرس في تصدير التقويم (ICS): «م/ص» والأرقام العربية وتجاوز منتصف الليل، بلا محاكي.
final class AccountIcsTimeTests: XCTestCase {
    private var utc: Calendar {
        var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "UTC")!; return c
    }
    private func day(_ m: Int, _ d: Int) -> Date { utc.date(from: DateComponents(year: 2026, month: m, day: d, hour: 12))! }
    private func clock(_ s: String) -> String {
        AccountCalendarMath.clock(s).map { "\($0.hour):\($0.minute)" } ?? "nil"
    }

    func testClockParsesTwentyFourHourAndArabicSuffixes() {
        XCTAssertEqual(clock("19:30"), "19:30")
        XCTAssertEqual(clock("6:00 م"), "18:0")
        XCTAssertEqual(clock("6:00 مساءً"), "18:0")
        XCTAssertEqual(clock("6 م"), "18:0")
        XCTAssertEqual(clock("9:15 صباحًا"), "9:15")
        XCTAssertEqual(clock("12:00 م"), "12:0", "الظهر يبقى 12")
        XCTAssertEqual(clock("12:15 ص"), "0:15", "بعد منتصف الليل")
        XCTAssertEqual(clock("6:00 م – 7:00 م"), "18:0", "أول وقت في المدى")
    }

    func testClockReadsArabicDigits() {
        XCTAssertEqual(clock("٦:٣٠ م"), "18:30")
        XCTAssertEqual(clock("۷:۰۰"), "7:0")
    }

    func testClockRejectsTextWithoutValidTime() {
        XCTAssertEqual(clock("بعد المغرب"), "nil")
        XCTAssertEqual(clock(""), "nil")
        XCTAssertEqual(clock("25:00"), "nil")
        XCTAssertEqual(clock("7:75"), "nil")
    }

    func testEveningLessonExportsAsEveningNotMorning() {
        XCTAssertEqual(AccountCalendarMath.icsTime(day(10, 11), time: "6:00 مساءً", calendar: utc), "20261011T180000")
        XCTAssertEqual(AccountCalendarMath.icsTime(day(10, 11), time: "6:00 مساءً", plusHours: 1, calendar: utc), "20261011T190000")
    }

    func testEndPastMidnightRollsToNextDayAndMonth() {
        XCTAssertEqual(AccountCalendarMath.icsTime(day(10, 11), time: "23:30", plusHours: 1, calendar: utc), "20261012T003000")
        XCTAssertEqual(AccountCalendarMath.icsTime(day(10, 31), time: "11:00 م", plusHours: 1, calendar: utc), "20261101T000000")
    }

    func testMissingOrPrayerRelativeTimeFallsBackToSixWithOneHourEvent() {
        for t in [nil, "", "بعد المغرب"] as [String?] {
            XCTAssertEqual(AccountCalendarMath.icsTime(day(10, 11), time: t, calendar: utc), "20261011T060000")
            XCTAssertEqual(AccountCalendarMath.icsTime(day(10, 11), time: t, plusHours: 1, calendar: utc), "20261011T070000")
        }
    }

    func testIcsUsesParsedStartAndEnd() {
        let ev = AccountCalendarEvent(lesson: AccountLesson(id: "e", title: "درس", lessonTime: "8:00 م"))
        let ics = AccountCalendarMath.ics([(date: day(10, 11), event: ev)], monthLabel: "أكتوبر", stamp: day(10, 11), calendar: utc)
        XCTAssertTrue(ics.contains("DTSTART;TZID=Asia/Kuwait:20261011T200000"))
        XCTAssertTrue(ics.contains("DTEND;TZID=Asia/Kuwait:20261011T210000"))
    }
}
