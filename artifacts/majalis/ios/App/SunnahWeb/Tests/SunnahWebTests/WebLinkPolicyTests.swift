import XCTest
@testable import SunnahWeb

final class WebLinkPolicyTests: XCTestCase {
    private let policy = WebLinkPolicy()

    func testURLForPath() {
        XCTAssertEqual(policy.url(for: "/lessons/12?x=1").absoluteString, "https://majlisilm.com/lessons/12?x=1")
        XCTAssertEqual(policy.url(for: "quran-hub").absoluteString, "https://majlisilm.com/quran-hub")
    }

    func testAppPathOnlyForOwnHosts() {
        XCTAssertEqual(policy.appPath(of: URL(string: "https://www.majlisilm.com/a?b=1")!), "/a?b=1")
        XCTAssertEqual(policy.appPath(of: URL(string: "https://majlisilm.com")!), "/")
        XCTAssertNil(policy.appPath(of: URL(string: "https://evil.com/a")!))
        XCTAssertNil(policy.appPath(of: URL(string: "https://majlisilm.com.evil.com/a")!))
    }

    func testUserLinkToOtherPagePushes() {
        let d = policy.decide(URL(string: "https://majlisilm.com/lessons/3")!, currentPath: "/lessons", isMainFrame: true, isUserLink: true)
        XCTAssertEqual(d, .push(path: "/lessons/3"))
    }

    func testInitialLoadAndRedirectStayInPlace() {
        let d = policy.decide(URL(string: "https://majlisilm.com/login")!, currentPath: "/lessons", isMainFrame: true, isUserLink: false)
        XCTAssertEqual(d, .allow)
    }

    func testSamePageAnchorStays() {
        let d = policy.decide(URL(string: "https://majlisilm.com/lessons#part2")!, currentPath: "/lessons", isMainFrame: true, isUserLink: true)
        XCTAssertEqual(d, .allow)
    }

    func testExternalOpensOutside() {
        let url = URL(string: "https://youtube.com/watch?v=1")!
        XCTAssertEqual(policy.decide(url, currentPath: "/", isMainFrame: true, isUserLink: true), .openExternally(url))
        let mail = URL(string: "mailto:a@b.c")!
        XCTAssertEqual(policy.decide(mail, currentPath: "/", isMainFrame: true, isUserLink: true), .openExternally(mail))
    }

    func testSubframeEmbedsAllowedButNotPushed() {
        let embed = URL(string: "https://www.youtube.com/embed/x")!
        XCTAssertEqual(policy.decide(embed, currentPath: "/", isMainFrame: false, isUserLink: false), .allow)
        let own = URL(string: "https://majlisilm.com/embed")!
        XCTAssertEqual(policy.decide(own, currentPath: "/", isMainFrame: false, isUserLink: true), .allow)
    }

    func testSubframeCustomSchemeCancelled() {
        let d = policy.decide(URL(string: "itms-apps://x")!, currentPath: "/", isMainFrame: false, isUserLink: false)
        XCTAssertEqual(d, .cancel)
    }
}
