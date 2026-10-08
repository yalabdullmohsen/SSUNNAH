import XCTest
@testable import SunnahWidgetKit

final class WidgetFormatTests: XCTestCase {
    func testDigits() {
        XCTAssertEqual(WidgetFormat.digits(1447), "١٤٤٧")
    }

    func testArabicDayPlurals() {
        XCTAssertEqual(WidgetFormat.days(0), "٠ يوم")
        XCTAssertEqual(WidgetFormat.days(1), "١ يوم")
        XCTAssertEqual(WidgetFormat.days(2), "٢ يومان")
        XCTAssertEqual(WidgetFormat.days(3), "٣ أيام")
        XCTAssertEqual(WidgetFormat.days(7), "٧ أيام")
        XCTAssertEqual(WidgetFormat.days(10), "١٠ أيام")
        XCTAssertEqual(WidgetFormat.days(11), "١١ يومًا")
        XCTAssertEqual(WidgetFormat.days(100), "١٠٠ يومًا")
        XCTAssertEqual(WidgetFormat.days(-5), "٠ يوم")
    }

    func testDuration() {
        XCTAssertEqual(WidgetFormat.duration(seconds: 45 * 60), "٤٥ د")
        XCTAssertEqual(WidgetFormat.duration(seconds: 3 * 3600 + 12 * 60 + 59), "٣ س ١٢ د")
        XCTAssertEqual(WidgetFormat.duration(seconds: -10), "٠ د")
    }
}
