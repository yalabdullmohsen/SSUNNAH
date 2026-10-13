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

    func testOpenPushesOnSingleStackAndHomeResets() {
        let router = AppRouter()
        router.open(path: "/prayer-times/settings")
        XCTAssertEqual(router.stack, [.web(path: "/prayer-times/settings")])
        router.open(path: "/prayer-times/settings")
        XCTAssertEqual(router.stack.count, 1, "لا تكرار للوجهة نفسها")
        router.open(path: "/quran-hub")
        XCTAssertEqual(router.stack.count, 2)
        router.open(path: "/")
        XCTAssertEqual(router.stack, [])
    }

    func testDeepLinks() {
        let router = AppRouter()
        XCTAssertTrue(router.open(url: URL(string: "https://majlisilm.com/quran-hub/juz/3")!))
        XCTAssertEqual(router.stack, [.web(path: "/quran-hub/juz/3")])
        XCTAssertTrue(router.open(url: URL(string: "majlisilm://prayer-times")!))
        XCTAssertEqual(router.stack.last, .web(path: "/prayer-times"))
        XCTAssertFalse(router.open(url: URL(string: "https://example.com/x")!))
    }

    func testBackPopsOneLevelAndSectionsRoutePushes() {
        let router = AppRouter()
        router.open(path: "/sections")
        router.open(path: "/fiqh")
        XCTAssertEqual(router.stack, [.web(path: "/sections"), .web(path: "/fiqh")])
        router.stack.removeLast()
        XCTAssertEqual(router.stack, [.web(path: "/sections")], "الرجوع يعيد مستوى واحدًا لا الجذر")
    }

    func testEveryHomeShortcutRouteIsAppRouterReachable() {
        let router = AppRouter()
        for s in HomeScreen.shortcuts {
            router.open(path: "/")
            router.open(path: s.route)
            XCTAssertEqual(router.stack, [.web(path: Route.normalize(s.route))], s.route)
        }
    }
}
