import XCTest
@testable import SunnahNative

/// تحويل الروابط العميقة وروابط النطاق إلى مسارات: المخطط الخاص، والنطاقات المعروفة فقط، وعدم التفريق بين حالة الأحرف.
final class RouteDeepLinkTests: XCTestCase {
    private func path(_ s: String, hosts: Set<String> = AppHosts.web) -> String? { Route.path(from: URL(string: s)!, hosts: hosts) }

    func testCustomSchemeHostBecomesFirstSegment() {
        XCTAssertEqual(path("majlisilm://prayer-times"), "/prayer-times")
        XCTAssertEqual(path("majlisilm://lessons/abc?ref=widget"), "/lessons/abc?ref=widget")
        XCTAssertEqual(path("majlisilm://lessons/"), "/lessons")
    }

    func testKnownWebHostsMapToTheirPath() {
        for h in AppHosts.web { XCTAssertEqual(path("https://\(h)/lessons/x"), "/lessons/x", h) }
        XCTAssertEqual(path("http://ssunnah.com/adhkar?cat=morning"), "/adhkar?cat=morning")
        XCTAssertEqual(path("https://ssunnah.com/lessons/"), "/lessons")
    }

    func testBareHostOpensHome() {
        XCTAssertEqual(path("https://www.ssunnah.com"), "/")
        XCTAssertEqual(path("https://ssunnah.com/"), "/")
    }

    func testSchemeAndHostAreCaseInsensitive() {
        XCTAssertEqual(path("https://SSunnah.com/lessons"), "/lessons")
        XCTAssertEqual(path("HTTPS://WWW.SSUNNAH.COM/adhkar"), "/adhkar")
        XCTAssertEqual(path("MajlisIlm://prayer-times"), "/prayer-times")
    }

    func testPathCaseIsPreserved() {
        XCTAssertEqual(path("https://ssunnah.com/Lessons/AbC"), "/Lessons/AbC")
    }

    func testForeignHostsAndSchemesAreRejected() {
        XCTAssertNil(path("https://evil.com/lessons"))
        XCTAssertNil(path("https://ssunnah.com.evil.com/lessons"))
        XCTAssertNil(path("https://evilssunnah.com/lessons"))
        XCTAssertNil(path("ftp://ssunnah.com/lessons"))
        XCTAssertNil(path("mailto:info@ssunnah.com"))
    }

    func testCustomHostSetOverridesDefault() {
        XCTAssertEqual(path("https://staging.example/x", hosts: ["staging.example"]), "/x")
        XCTAssertNil(path("https://ssunnah.com/x", hosts: ["staging.example"]))
    }
}
