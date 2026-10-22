import XCTest
@testable import SunnahNative

/// نصوص خطة الحفظ بعدد عربي سليم: الوتيرة، والتقدّم عن الجدول، ونص التذكير اليومي.
final class HifzFormatTests: XCTestCase {
    func testPaceInPagesAndLines() {
        XCTAssertEqual(HifzFormat.pace(15), "صفحة يوميًا")
        XCTAssertEqual(HifzFormat.pace(30), "صفحتان يوميًا")
        XCTAssertEqual(HifzFormat.pace(45), "\(3.arabicDigits) صفحات يوميًا")
        XCTAssertEqual(HifzFormat.pace(165), "\(11.arabicDigits) صفحة يوميًا")
        XCTAssertEqual(HifzFormat.pace(5), "\(5.arabicDigits) أسطر يوميًا")
        XCTAssertEqual(HifzFormat.pace(2), "سطران يوميًا")
        XCTAssertEqual(HifzFormat.pace(20), "\(20.arabicDigits) سطرًا يوميًا")
    }

    func testStatusDaysAgreeWithNumber() {
        typealias P = HifzPlanMath.Progress
        XCTAssertEqual(HifzFormat.status(P(expectedLines: 0, doneLines: 15, linesPerDay: 15)), "متقدّم عن الجدول بنحو يوم")
        XCTAssertEqual(HifzFormat.status(P(expectedLines: 0, doneLines: 30, linesPerDay: 15)), "متقدّم عن الجدول بنحو يومين")
        XCTAssertEqual(HifzFormat.status(P(expectedLines: 75, doneLines: 0, linesPerDay: 15)), "متأخر عن الجدول بنحو \(5.arabicDigits) أيام")
        XCTAssertEqual(HifzFormat.status(P(expectedLines: 15, doneLines: 15, linesPerDay: 15)), "أنت على الجدول")
    }

    func testReminderBodyCountsReviewPages() {
        XCTAssertEqual(HifzReminder.body(.init(newPages: [12], nearPages: [1, 2], farPages: [3])),
                       "حفظ جديد: صفحة \(12.arabicDigits) · مراجعة \(3.arabicDigits) صفحات")
        XCTAssertEqual(HifzReminder.body(.init(newPages: [], nearPages: [1], farPages: [])), "مراجعة صفحة واحدة")
        XCTAssertEqual(HifzReminder.body(.init(newPages: [], nearPages: [1], farPages: [2])), "مراجعة صفحتين")
        XCTAssertEqual(HifzReminder.body(.init(newPages: [], nearPages: [], farPages: [])), "حان وقت وردك")
    }
}
