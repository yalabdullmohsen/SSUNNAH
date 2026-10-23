import XCTest
@testable import SunnahNative

/// شريط وضع التكرار: «القراءة ن من هدف» بأرقام عربية، ن هي القراءة الجارية (السلسلة + 1) ولا تتجاوز الهدف.
@MainActor
final class TasmeeRepeatTextTests: XCTestCase {
    func testCurrentReadingIsStreakPlusOne() {
        XCTAssertEqual(MushafTasmeeController.repeatText(streak: 0, target: 3), "القراءة ١ من ٣")
        XCTAssertEqual(MushafTasmeeController.repeatText(streak: 2, target: 3), "القراءة ٣ من ٣")
    }

    func testCappedAtTargetAndTwoDigitTargets() {
        XCTAssertEqual(MushafTasmeeController.repeatText(streak: 3, target: 3), "القراءة ٣ من ٣", "اكتمال الهدف لا يعرض «٤ من ٣»")
        XCTAssertEqual(MushafTasmeeController.repeatText(streak: 9, target: 20), "القراءة ١٠ من ٢٠")
    }

    func testNoWesternDigitsLeak() {
        let s = MushafTasmeeController.repeatText(streak: 11, target: TasmeeModeOptions.repeatRange.upperBound)
        XCTAssertNil(s.range(of: "[0-9]", options: .regularExpression), s)
    }
}
