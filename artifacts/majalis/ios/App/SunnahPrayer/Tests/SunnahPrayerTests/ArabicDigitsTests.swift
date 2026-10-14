import XCTest
@testable import SunnahPrayer

final class ArabicDigitsTests: XCTestCase {
    func testDigitsOnly() {
        XCTAssertEqual(PrayerTimeFormat.arabicDigits("القرآن الكريم — ٩٣:٥"), "القرآن الكريم — 93:5")
        XCTAssertEqual(PrayerTimeFormat.arabicDigits("٠ من ٥ صفحة"), "0 من 5 صفحة")
        XCTAssertEqual(PrayerTimeFormat.arabicDigits("بلا أرقام"), "بلا أرقام")
    }
}
