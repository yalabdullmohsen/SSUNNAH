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
    /// حارس: أي مسار مسجَّل في الكتالوج يبدأ بـ`/mushaf` لا يُظهر شريط التبويب، فلا يظهر مسار مصحف جديد بشريط يغطي آخر سطر.
    func testNoCatalogMushafRouteShowsTabBar() {
        let routes = SectionsCatalog.entries.map(\.route).filter { $0 == "/mushaf" || $0.hasPrefix("/mushaf/") }
        XCTAssertFalse(routes.isEmpty)
        for r in routes { XCTAssertTrue(ReaderRoutes.hidesTabBar(path: r), r) }
    }
    /// حارس: كل مسار يبدأ بـmushaf في MushafRoute يمرّ من القاعدة نفسها.
    func testMushafRouteParsedPathsAreCovered() {
        for p in ["/mushaf/page/1", "/mushaf/ayah/2:255"] {
            XCTAssertNotNil(MushafRoute.parse(p)); XCTAssertTrue(ReaderRoutes.hidesTabBar(path: p))
        }
    }
}
