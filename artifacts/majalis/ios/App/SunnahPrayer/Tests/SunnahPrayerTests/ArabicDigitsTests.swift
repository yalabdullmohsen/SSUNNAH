import XCTest
@testable import SunnahPrayer

final class ArabicDigitsTests: XCTestCase {
    func testDigitsOnly() {
        XCTAssertEqual(PrayerTimeFormat.arabicDigits("القرآن الكريم — 93:5"), "القرآن الكريم — ٩٣:٥")
        XCTAssertEqual(PrayerTimeFormat.arabicDigits("0 من 5 صفحة"), "٠ من ٥ صفحة")
        XCTAssertEqual(PrayerTimeFormat.arabicDigits("بلا أرقام"), "بلا أرقام")
    }
}
