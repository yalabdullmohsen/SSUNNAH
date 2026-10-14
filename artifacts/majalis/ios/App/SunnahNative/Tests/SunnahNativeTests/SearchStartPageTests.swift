import XCTest
@testable import SunnahNative

final class SearchStartPageTests: XCTestCase {
    func testPushedPutsNewestFirstWithoutDuplicates() {
        XCTAssertEqual(SearchTemplate.pushed("الصلاة", into: ["الحديث", "الصلاة", "الفقه"]), ["الصلاة", "الحديث", "الفقه"])
    }
    func testPushedCapsAtEightAndIgnoresShortTerms() {
        let full = (1...8).map { "كلمة\($0)" }
        XCTAssertEqual(SearchTemplate.pushed("جديد", into: full).count, 8)
        XCTAssertEqual(SearchTemplate.pushed("ا", into: full), full)
    }
    func testSuggestedAndQuickIDsExistInBundledSearchIndex() throws {
        let url = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            .appendingPathComponent("../../../../../../../ios-native/Data").standardized
        let dirs = try FileManager.default.contentsOfDirectory(at: url, includingPropertiesForKeys: nil)
        guard let file = dirs.map({ $0.appendingPathComponent("search.json") }).first(where: { FileManager.default.fileExists(atPath: $0.path) }) else { return XCTFail("search.json غير موجود") }
        let ids = Set(try JSONDecoder().decode([ContentItem].self, from: Data(contentsOf: file)).map(\.id))
        for id in SearchTemplate.suggestedIDs + SearchTemplate.quickIDs { XCTAssertTrue(ids.contains(id), id) }
    }
}
