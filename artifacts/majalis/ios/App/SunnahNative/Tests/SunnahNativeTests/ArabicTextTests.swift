import XCTest
@testable import SunnahNative

final class ArabicTextTests: XCTestCase {
    func testNormalizeFoldsVariants() {
        XCTAssertEqual(ArabicText.normalize("إِيمَانٌ"), ArabicText.normalize("ايمان"))
        XCTAssertEqual(ArabicText.normalize("الصلاة"), ArabicText.normalize("الصلاه"))
        XCTAssertEqual(ArabicText.normalize("هدى"), ArabicText.normalize("هدي"))
    }
    func testMatches() {
        XCTAssertTrue(ArabicText.matches("أركان الإيمان", query: "الايمان"))
        XCTAssertFalse(ArabicText.matches("أركان الإيمان", query: "الزكاة"))
        XCTAssertTrue(ArabicText.matches("أي شيء", query: ""))
    }
}
