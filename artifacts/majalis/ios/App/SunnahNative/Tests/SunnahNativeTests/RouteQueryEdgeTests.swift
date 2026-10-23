import XCTest
@testable import SunnahNative

/// روابط بمعاملات استعلام: الرئيسية مع `utm` لا تُكدَّس، وآية المصحف من صيغة الويب `/mushaf/page/N?ayah=…` مع فكّ الترميز.
@MainActor
final class RouteQueryEdgeTests: XCTestCase {
    func testHomeWithQueryOrFragmentResetsStack() {
        let r = AppRouter()
        r.open(path: "/lessons")
        r.open(path: "/?utm_source=x")
        XCTAssertTrue(r.stack.isEmpty)
        r.open(path: "/lessons")
        r.open(url: URL(string: "https://ssunnah.com/?utm_source=x#top")!)
        XCTAssertTrue(r.stack.isEmpty)
    }

    func testNonHomeQueryStillPushes() {
        let r = AppRouter()
        r.open(path: "/lessons?x=1")
        XCTAssertEqual(r.stack, [.web(path: "/lessons?x=1")])
    }

    func testWebPageLinkWithAyahQueryOpensAyah() {
        XCTAssertEqual(MushafRoute.parse("/mushaf/page/42?ayah=2%3A255"), .ayah(surah: 2, ayah: 255))
        XCTAssertEqual(MushafRoute.parse("/mushaf/page/42?ayah=2:255"), .ayah(surah: 2, ayah: 255))
        XCTAssertEqual(MushafRoute.parse("/mushaf/page/42?ayah=bad"), .page(42), "آية غير صالحة: تبقى الصفحة")
        XCTAssertEqual(MushafRoute.parse("/mushaf/page/42?x=1"), .page(42))
    }

    func testWidgetQueryFormDecodesPercentEncoding() {
        XCTAssertEqual(MushafRoute.parse("/mushaf?ayah=2%3A255"), .ayah(surah: 2, ayah: 255))
        XCTAssertEqual(MushafRoute.parse("/mushaf?page=1&ayah=18%3A10"), .ayah(surah: 18, ayah: 10))
    }

    func testAyahQueryIgnoredOnOtherMushafPaths() {
        XCTAssertEqual(MushafRoute.parse("/mushaf/ayah/1:1?ayah=2:255"), .ayah(surah: 1, ayah: 1), "المسار الصريح أولى")
        XCTAssertNil(MushafRoute.parse("/quran?ayah=2:255"))
    }
}
