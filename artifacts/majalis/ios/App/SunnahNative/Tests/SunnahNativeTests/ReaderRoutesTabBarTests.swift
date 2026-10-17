import XCTest
@testable import SunnahNative

final class ReaderRoutesTabBarTests: XCTestCase {
    func testEveryMushafRouteHidesTabBar() {
        for p in ["/mushaf", "/mushaf/page/37", "/mushaf/ayah/3:37", "/mushaf?page=5&ayah=3:37", "/tafsir/3:37", "/mushaf/search"] {
            XCTAssertTrue(ReaderRoutes.hidesTabBar(path: p), p)
        }
    }
    func testOtherRoutesKeepTabBar() {
        for p in ["/", "/hadith/daif", "/mushafx", "/quran/offline-player", "/settings"] {
            XCTAssertFalse(ReaderRoutes.hidesTabBar(path: p), p)
        }
    }
    /// حارس: كل مسار يبدأ بـmushaf في MushafRoute يمرّ من القاعدة نفسها.
    func testMushafRouteParsedPathsAreCovered() {
        for p in ["/mushaf/page/1", "/mushaf/ayah/2:255"] {
            XCTAssertNotNil(MushafRoute.parse(p)); XCTAssertTrue(ReaderRoutes.hidesTabBar(path: p))
        }
    }
}
