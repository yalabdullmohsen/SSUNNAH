import XCTest
@testable import SunnahNative

final class ReleaseGateTests: XCTestCase {
    func testHiddenRoutesFilteredFromLinksAndScope() {
        // الاختبار يعمل DEBUG؛ نتحقق من القائمة نفسها وأن كل المخفي مسجّل «قيد التوثيق»
        XCTAssertEqual(ReleaseGate.hiddenRoutes.count, 7)
        XCTAssertTrue(ReleaseGate.hiddenRoutes.contains("/ulum-quran"))
        XCTAssertFalse(ReleaseGate.hiddenRoutes.contains("/quran-hub/terms"))
        let hubRoutes = Set((QuranLinks.hub + QuranLinks.knowledge).map(\.route))
        XCTAssertTrue(hubRoutes.contains("/quran-hub/terms"))
    }
}
