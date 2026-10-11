import XCTest
@testable import SunnahNative

final class AdhkarBundleTests: XCTestCase {
    func testDecodesContractRowsAndGroups() throws {
        let json = #"[{"id":"a1","category_id":"morning","text":"ن","repeat_count":3,"source_name":"م","grade":"صحيح","extra":1},{"id":"a2","category_id":"morning","text":"ن2","repeat_count":1},{"id":"b1","category_id":"sleep","text":"ن3","repeat_count":1}]"#
        let rows = try JSONDecoder().decode([AdhkarItem].self, from: Data(json.utf8))
        let screen = AdhkarScreen(content: rows)
        XCTAssertEqual(screen.categories.map(\.id), ["morning", "sleep"])
        XCTAssertEqual(screen.categories[0].items.count, 2)
        XCTAssertEqual(rows[0].repeatCount, 3)
    }
}
