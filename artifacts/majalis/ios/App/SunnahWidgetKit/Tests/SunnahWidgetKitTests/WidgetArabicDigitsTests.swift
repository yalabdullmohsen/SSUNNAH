import XCTest
@testable import SunnahWidgetKit

/// مصادر الودجت بأرقام هندية، عبر التنفيذ المشترك نفسه مع التطبيق.
final class WidgetArabicDigitsTests: XCTestCase {
    func testSourcesUseArabicIndicDigits() {
        XCTAssertEqual(WidgetFormat.arabicDigits("صحيح مسلم: 720"), "صحيح مسلم: ٧٢٠")
        XCTAssertEqual(WidgetFormat.arabicDigits("البقرة: 117؛ الأنعام: 101"), "البقرة: ١١٧؛ الأنعام: ١٠١")
    }
    func testNonDigitsUntouched() {
        XCTAssertEqual(WidgetFormat.arabicDigits("سبحان الله"), "سبحان الله")
    }
}
