import XCTest
@testable import SunnahNative

final class SunnahAyahRangeTests: XCTestCase {
    func testOrdersAscendingWithLRM() {
        XCTAssertEqual(SunnahAyahRange.format(surah: 23, from: 12, to: 14), "\u{200E}23:12–14\u{200E}")
        XCTAssertEqual(SunnahAyahRange.format(surah: 23, from: 14, to: 12), "\u{200E}23:12–14\u{200E}")
        XCTAssertEqual(SunnahAyahRange.format(surah: 2, from: 6, to: 7), "\u{200E}2:6–7\u{200E}")
    }
    func testSingleAyah() { XCTAssertEqual(SunnahAyahRange.format(surah: 2, from: 30), "\u{200E}2:30\u{200E}") }
    func testParsesReversedAndArabicDigits() {
        XCTAssertEqual(SunnahAyahRange.display("23:14-12"), "\u{200E}23:12–14\u{200E}")
        XCTAssertEqual(SunnahAyahRange.display("٢٣:١٢–١٤"), "\u{200E}23:12–14\u{200E}")
        XCTAssertEqual(SunnahAyahRange.mushafPath("7:7-6"), "/mushaf/ayah/7:6")
    }
    func testInvalidRefIsReturnedUnchanged() {
        XCTAssertEqual(SunnahAyahRange.display("نص"), "نص")
        XCTAssertNil(SunnahAyahRange.parse("200:1"))
    }
}
