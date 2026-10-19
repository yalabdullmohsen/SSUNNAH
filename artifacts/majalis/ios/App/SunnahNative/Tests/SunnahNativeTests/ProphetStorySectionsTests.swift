import XCTest
@testable import SunnahNative

final class ProphetStorySectionsTests: XCTestCase {
    private func item(_ json: String) throws -> SirahKnowledgeItem {
        try JSONDecoder().decode(SirahKnowledgeItem.self, from: Data(json.utf8))
    }

    func testNewSectionsFormatShowsOnlyDocumentedSections() throws {
        let k = try item(#"""
        {"id":"prophet-adam","title":"آدم","body":"## التعريف\nنص","review_status":"verified",
         "sources":[{"book":"المصحف"}],
         "evidences":[{"type":"ayah","ref":"2:30","text":""}],
         "sections":[
           {"key":"identity","title":"التعريف","body":"نص","sources":[{"book":"المصحف"}]},
           {"key":"saadi","title":"من تفسير السعدي","body":"فقرة","sources":[{"book":"تيسير الكريم الرحمن"}]},
           {"key":"sunnah","title":"من السنة","body":"متن","sources":[]}]}
        """#)
        let p = try XCTUnwrap(ProphetStory(k))
        XCTAssertEqual(p.visibleSections, [.identity, .saadi, .verses])
        XCTAssertEqual(p.ayat.map(\.ref), ["2:30"])
    }
    func testFooterSourcesUseUnifiedSourceRef() throws {
        let k = try item(#"""
        {"id":"prophet-nuh","title":"نوح","body":"## التعريف\nنص","review_status":"verified",
         "sources":[{"book":"تفسير ابن كثير","locator":"سورة هود"},{"book":"المصحف"}],
         "sections":[{"key":"identity","title":"التعريف","body":"نص","sources":[{"book":"المصحف"}]}]}
        """#)
        let p = try XCTUnwrap(ProphetStory(k))
        XCTAssertEqual(p.sourceRefs.map(\.display), ["تفسير ابن كثير، سورة هود", "المصحف"])
    }
}
