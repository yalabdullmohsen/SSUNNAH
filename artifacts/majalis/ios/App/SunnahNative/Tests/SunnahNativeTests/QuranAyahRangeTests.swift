import XCTest
@testable import SunnahNative

final class QuranAyahRangeTests: XCTestCase {
    func testParseFormats() {
        XCTAssertEqual(QuranAyahRange.parse("6–7", surah: 12), QuranAyahRange(surah: 12, from: 6, to: 7))
        XCTAssertEqual(QuranAyahRange.parse("6-7", surah: 12), QuranAyahRange(surah: 12, from: 6, to: 7))
        XCTAssertEqual(QuranAyahRange.parse("45", surah: 12), QuranAyahRange(surah: 12, from: 45, to: 45))
        XCTAssertEqual(QuranAyahRange.parse("21:81"), QuranAyahRange(surah: 21, from: 81, to: 81))
        XCTAssertEqual(QuranAyahRange.parse("38:30–31")?.keys, ["38:30", "38:31"])
    }
    func testRejectsInvalid() {
        XCTAssertNil(QuranAyahRange.parse("7-6", surah: 1))
        XCTAssertNil(QuranAyahRange.parse("6–7"))
        XCTAssertNil(QuranAyahRange.parse("a-b", surah: 1))
        XCTAssertNil(QuranAyahRange(surah: 115, from: 1, to: 1))
        XCTAssertNil(QuranAyahRange(surah: 1, from: 0, to: 1))
    }
    func testLabel() {
        XCTAssertEqual(QuranAyahRange(surah: 3, from: 37, to: 37)?.label, "3:37")
        XCTAssertEqual(QuranAyahRange(surah: 12, from: 6, to: 7)?.label, "12:6–7")
    }
}
