import XCTest
@testable import SunnahNative

@MainActor
final class AppRouterTests: XCTestCase {
    func testTabsMatchWebBottomNav() {
        XCTAssertEqual(AppTab.allCases.map(\.rootPath), ["/quran-hub", "/lessons", "/", "/prayer-times", "/sections"])
        XCTAssertEqual(AppTab.allCases.map(\.title), ["القرآن", "الدروس", "الرئيسية", "الصلاة", "الأقسام"])
    }

    func testOwningTab() {
        XCTAssertEqual(AppTab.owning(path: "/prayer-times/riyadh"), .prayer)
        XCTAssertEqual(AppTab.owning(path: "/qibla"), .prayer)
        XCTAssertEqual(AppTab.owning(path: "/quran/2"), .quran)
        XCTAssertEqual(AppTab.owning(path: "/lessons/123?x=1"), .lessons)
        XCTAssertEqual(AppTab.owning(path: "/hadith/5"), .home)
        XCTAssertEqual(AppTab.owning(path: "/lessonsx"), .home)
    }

    func testNormalize() {
        XCTAssertEqual(Route.normalize(""), "/")
        XCTAssertEqual(Route.normalize("lessons/"), "/lessons")
        XCTAssertEqual(Route.normalize("/a/?q=1"), "/a?q=1")
    }

    func testOpenPushesInOwningTabAndRootResets() {
        let router = AppRouter()
        router.open(path: "/prayer-times/settings")
        XCTAssertEqual(router.selectedTab, .prayer)
        XCTAssertEqual(router.stacks[.prayer], [.web(path: "/prayer-times/settings")])
        router.open(path: "/prayer-times/settings")
        XCTAssertEqual(router.stacks[.prayer]?.count, 1, "لا تكرار للوجهة نفسها")
        router.open(path: "/prayer-times")
        XCTAssertEqual(router.stacks[.prayer], [])
    }

    func testReselectPopsToRoot() {
        let router = AppRouter()
        router.open(path: "/lessons/1")
        router.select(.lessons)
        XCTAssertEqual(router.stacks[.lessons], [])
    }

    func testDeepLinks() {
        let router = AppRouter()
        XCTAssertTrue(router.open(url: URL(string: "https://majlisilm.com/quran-hub/juz/3")!))
        XCTAssertEqual(router.selectedTab, .quran)
        XCTAssertTrue(router.open(url: URL(string: "majlisilm://prayer-times")!))
        XCTAssertEqual(router.selectedTab, .prayer)
        XCTAssertFalse(router.open(url: URL(string: "https://example.com/x")!))
    }
}
