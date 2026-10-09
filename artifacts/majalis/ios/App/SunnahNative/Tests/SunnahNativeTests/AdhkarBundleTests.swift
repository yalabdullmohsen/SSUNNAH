import XCTest
@testable import SunnahNative

final class AdhkarBundleTests: XCTestCase {
    func testBundleDecodesWithCategoriesAndItems() {
        let b = AdhkarBundle.shared
        XCTAssertGreaterThan(b.categories.count, 0)
        XCTAssertGreaterThan(b.items.count, 0)
        XCTAssertNotNil(b.category(slug: "morning"))
    }

    func testEveryItemBelongsToKnownCategoryAndHasSource() {
        let b = AdhkarBundle.shared
        let ids = Set(b.categories.map(\.id))
        for item in b.items {
            XCTAssertTrue(ids.contains(item.categoryId), item.id)
            XCTAssertFalse(item.source.isEmpty, item.id)
            XCTAssertGreaterThan(item.count, 0, item.id)
        }
        XCTAssertEqual(Set(b.items.map(\.id)).count, b.items.count)
    }

    func testRouteSlug() {
        XCTAssertEqual(AdhkarRoute.slug(from: "/adhkar/morning"), "morning")
        XCTAssertEqual(AdhkarRoute.slug(from: "adhkar/evening/"), "evening")
        XCTAssertNil(AdhkarRoute.slug(from: "/adhkar"))
        XCTAssertNil(AdhkarRoute.slug(from: "/quran/morning"))
    }
}
