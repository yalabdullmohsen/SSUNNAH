import XCTest
@testable import SunnahNative

/// يحسب المسارات الواصلة من واجهة «كل الأقسام» ويقارنها بجرد الـ212 مطروحًا منه الاستثناءات المبرَّرة (SectionsExceptions).
/// يفشل عند أي مسار يتيم، وعند استثناء قديم لم يعد في الجرد، وعند مسار معروض خارج الجرد.
final class SectionsCoverageTests: XCTestCase {
    private func reachable(nav: LibraryNavigation? = nil) -> Set<String> {
        Set(LibraryAdapters.sectionsPage(nav, scope: { _ in true }).flatMap { $0.links.map(\.route) })
    }

    func testNoOrphanRoutes() {
        let inventory = Set(LibraryRouteScope.kept.filter { !$0.contains(":") })
        let expected = inventory.subtracting(SectionsExceptions.routes)
        let shown = reachable()
        XCTAssertEqual(expected.subtracting(shown).sorted(), [], "مسارات يتيمة لا تصل إليها صفحة الأقسام")
        XCTAssertEqual(shown.subtracting(inventory).sorted(), [], "مسارات معروضة خارج جرد الـ212")
    }

    func testExceptionsAreCurrentAndJustified() {
        let inventory = Set(LibraryRouteScope.kept)
        for (route, why) in SectionsExceptions.reasons {
            XCTAssertTrue(inventory.contains(route), "استثناء قديم: \(route)")
            XCTAssertFalse(why.isEmpty, "استثناء بلا مبرّر: \(route)")
            XCTAssertFalse(reachable().contains(route), "\(route) مستثنى لكنه معروض")
        }
    }

    func testDefaultScopeHidesOnlyDeferredAndEveryGroupIsNonEmpty() {
        let groups = LibraryAdapters.sectionsPage(nil)
        XCTAssertEqual(groups.count, SectionsCatalog.groupOrder.count)
        XCTAssertTrue(groups.allSatisfy { !$0.links.isEmpty })
        let routes = groups.flatMap { $0.links.map(\.route) }
        XCTAssertEqual(routes.count, Set(routes).count, "مسار مكرَّر في الصفحة")
        XCTAssertTrue(routes.allSatisfy(LibraryRouteScope.contains))
    }
}
