import XCTest
@testable import SunnahNative

final class SunnahArabicTextTests: XCTestCase {
    func testLineSpacingRatio() {
        XCTAssertEqual(SunnahArabicText.lineSpacing(size: 20, dense: false), 10, accuracy: 0.001)
        XCTAssertEqual(SunnahArabicText.lineSpacing(size: 20, dense: true), 12, accuracy: 0.001)
    }
    func testDensity() {
        XCTAssertTrue(SunnahArabicText.isDense("إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ"))
        XCTAssertFalse(SunnahArabicText.isDense("إنما الأعمال بالنيات"))
        XCTAssertFalse(SunnahArabicText.isDense(""))
    }
}
