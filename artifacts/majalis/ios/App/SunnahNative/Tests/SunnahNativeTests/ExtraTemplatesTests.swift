import XCTest
import SwiftUI
@testable import SunnahNative

final class ExtraTemplatesTests: XCTestCase {
    func testListTemplateSourceCompatibleAndInline() {
        let items = [ContentItem(id: "1", title: "ت", body: "نص")]
        _ = ListTemplate(items: items, detailBase: "/x").body
        _ = ListTemplate(items: items, detailBase: "/x", inline: true).body
    }
    func testTreeDepth() {
        let t = TreeNode(id: "a", title: "آدم", children: [TreeNode(id: "b", title: "شيث", children: [TreeNode(id: "c", title: "x")]), TreeNode(id: "d", title: "y")])
        XCTAssertEqual(t.depth, 3)
        XCTAssertEqual(TreeNode(id: "z", title: "z").depth, 1)
        _ = TreeTemplate(roots: [t]).body; _ = TreeTemplate(roots: []).body
    }
    func testMapPlaceValidityFiltersBadCoordinates() {
        XCTAssertTrue(MapPlace(id: "1", title: "مكة", latitude: 21.42, longitude: 39.83).isValid)
        XCTAssertFalse(MapPlace(id: "2", title: "x", latitude: 0, longitude: 0).isValid)
        XCTAssertFalse(MapPlace(id: "3", title: "x", latitude: 91, longitude: 10).isValid)
        XCTAssertFalse(MapPlace(id: "4", title: "x", latitude: 10, longitude: 181).isValid)
    }
    func testMapFitAndConstruct() {
        let r = MapTemplate.fit([MapPlace(id: "1", title: "a", latitude: 21, longitude: 39), MapPlace(id: "2", title: "b", latitude: 24, longitude: 40)])
        XCTAssertEqual(r.center.latitude, 22.5, accuracy: 0.001)
        _ = MapTemplate(places: []).body
        _ = MapTemplate(places: [MapPlace(id: "1", title: "a", latitude: 0, longitude: 0)]).body
    }
}

final class PlaceholderStateTests: XCTestCase {
    func testPlaceholderBuildsWithoutRawPath() {
        _ = RootTabView.placeholder(Route.web(path: "/mawarith/calculator"))
        _ = ErrorStateView(retry: {}).body
    }
}
