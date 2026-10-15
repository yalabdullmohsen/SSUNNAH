import XCTest
@testable import SunnahNative

final class MushafRouteTests: XCTestCase {
    func testPageRoute() {
        XCTAssertEqual(MushafRoute.parse("/mushaf/page/301"), .page(301))
        XCTAssertEqual(MushafRoute.parse("/mushaf/page/1"), .page(1))
        XCTAssertEqual(MushafRoute.parse("/mushaf/page/604"), .page(604))
        XCTAssertEqual(MushafRoute.parse("/mushaf/page/150"), .page(150))   // رابط الويدجت
    }
    func testAyahRoute() {
        XCTAssertEqual(MushafRoute.parse("/mushaf/ayah/18:10"), .ayah(surah: 18, ayah: 10))
        XCTAssertEqual(MushafRoute.parse("/mushaf/ayah/1:1"), .ayah(surah: 1, ayah: 1))
    }
    func testWidgetQueryForm() {
        XCTAssertEqual(MushafRoute.parse("/mushaf?page=301"), .page(301))
        XCTAssertEqual(MushafRoute.parse("/mushaf?page=1&ayah=1:1"), .ayah(surah: 1, ayah: 1))
        XCTAssertEqual(MushafRoute.parse("/mushaf?page=5&ayah=bad"), .page(5))
        XCTAssertNil(MushafRoute.parse("/mushaf?page=605"))
        XCTAssertNil(MushafRoute.parse("/mushaf?x=1"))
    }
    func testInvalidRoutesRejected() {
        for p in ["/mushaf", "/mushaf/page/0", "/mushaf/page/605", "/mushaf/page/x", "/mushaf/page/abc", "/mushaf/page/1.5", "/mushaf/page/-3", "/mushaf/page/", "/mushaf/ayah/115:1", "/mushaf/ayah/2", "/mushaf/ayah/2:0", "/mushaf/bookmarks", "/quran/page/3"] {
            XCTAssertNil(MushafRoute.parse(p), p)
        }
    }
    @MainActor func testResolverRegistersDeepLinks() {
        XCTAssertEqual(RouteResolver.trace(path: "/mushaf/page/301")?.step, "mushaf-deeplink")
        XCTAssertEqual(RouteResolver.trace(path: "/mushaf/ayah/2:255")?.step, "mushaf-deeplink")
        XCTAssertEqual(RouteResolver.trace(path: "/mushaf/page/150")?.step, "mushaf-deeplink")
        for bad in ["/mushaf/page/0", "/mushaf/page/605", "/mushaf/page/abc", "/mushaf/page/9999"] {
            XCTAssertNotEqual(RouteResolver.trace(path: bad)?.step, "mushaf-deeplink", bad)   // سلوك آمن: لا فتح لصفحة غير صالحة
        }
    }
}
