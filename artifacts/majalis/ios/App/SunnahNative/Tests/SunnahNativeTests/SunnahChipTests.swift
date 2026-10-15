import XCTest
@testable import SunnahNative

final class SunnahChipTests: XCTestCase {
    func testBlankChipIsNotRenderable() {
        for t in ["", " ", "  \n\t", "\u{00A0}"] { XCTAssertFalse(SunnahChip.isRenderable(t), "«\(t)»") }
    }
    func testNonBlankChipIsRenderable() {
        XCTAssertTrue(SunnahChip.isRenderable("قيد المراجعة"))
    }
}
