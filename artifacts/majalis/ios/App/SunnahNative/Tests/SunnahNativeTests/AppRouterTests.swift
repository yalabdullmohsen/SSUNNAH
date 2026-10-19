import XCTest
@testable import SunnahNative

@MainActor
final class AppRouterTests: XCTestCase {
    func testTabsMatchWebBottomNav() {
        XCTAssertEqual(AppTab.allCases.map(\.rootPath), ["/", "/quran-hub", "/prayer-times", "/sections", "/more"])
        XCTAssertEqual(AppTab.allCases.map(\.title), ["الرئيسية", "المصحف", "الصلاة", "الأقسام", "المزيد"])
    }

    func testOwningTab() {
        XCTAssertEqual(AppTab.owning(path: "/prayer-times/riyadh"), .prayer)
        XCTAssertEqual(AppTab.owning(path: "/qibla"), .prayer)
        XCTAssertEqual(AppTab.owning(path: "/quran/2"), .quran)
        XCTAssertEqual(AppTab.owning(path: "/lessons/123?x=1"), .sections)
        XCTAssertEqual(AppTab.owning(path: "/prophets/yusuf"), .sections)
        XCTAssertEqual(AppTab.owning(path: "/adhkar"), .sections)
        XCTAssertEqual(AppTab.owning(path: "/settings"), .more)
        XCTAssertEqual(AppTab.owning(path: "/"), .home)
        for p in ["/tasbih", "/seerah", "/flashcards", "/quiz", "/reading-plans", "/mawarith/calculator"] { XCTAssertEqual(AppTab.owning(path: p), .sections, p) }
        for p in ["/tafsir", "/quran-hub/tajweed", "/qiraat", "/mutashabihat"] { XCTAssertEqual(AppTab.owning(path: p), .quran, p) }
        for p in ["/stats", "/my-submissions", "/submit", "/feature-tour", "/car-mode"] { XCTAssertEqual(AppTab.owning(path: p), .more, p) }
        XCTAssertEqual(AppTab.owning(path: "/hadith/5"), .sections)
        XCTAssertEqual(AppTab.owning(path: "/lessonsx"), .sections)
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
