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

final class EffectiveTextSizeTests: XCTestCase {
    func testFollowsSystemAndAddsPref() {
        XCTAssertEqual(AppearancePrefs.effectiveSize(system: .large, pref: .standard), .large)
        XCTAssertEqual(AppearancePrefs.effectiveSize(system: .xxLarge, pref: .standard), .xxLarge)
        XCTAssertEqual(AppearancePrefs.effectiveSize(system: .large, pref: .large), .xxLarge)
        XCTAssertEqual(AppearancePrefs.effectiveSize(system: .accessibility1, pref: .small), .xxLarge)
        XCTAssertEqual(AppearancePrefs.effectiveSize(system: .large, pref: .xLarge), .accessibility1)
    }
    func testCappedAtAccessibility3() {
        XCTAssertEqual(AppearancePrefs.effectiveSize(system: .accessibility5, pref: .standard), .accessibility3)
        XCTAssertEqual(AppearancePrefs.effectiveSize(system: .accessibility2, pref: .xLarge), .accessibility3)
    }
}
