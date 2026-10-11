import XCTest
import SwiftUI
@testable import SunnahNative

final class GroupedListTemplateTests: XCTestCase {
    func testContentGroupIdentityAndInit() {
        let item = ContentItem(id: "a", title: "أركان الإيمان", subtitle: nil, body: "نص")
        let g = ContentGroup(id: "g1", title: "الإيمان", items: [item])
        XCTAssertEqual(g.id, "g1"); XCTAssertEqual(g.items.count, 1)
        XCTAssertEqual(g, ContentGroup(id: "g1", title: "الإيمان", items: [item]))
    }
    func testTemplateConstructsForEmptyAndNonEmpty() {
        _ = GroupedListTemplate(groups: []).body
        _ = GroupedListTemplate(groups: [ContentGroup(id: "g", title: "t", items: [ContentItem(id: "1", title: "x")])]).body
    }
}
