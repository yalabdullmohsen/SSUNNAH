import XCTest
@testable import SunnahNative

final class SourceRefTests: XCTestCase {
    func testAllShapes() {
        let json = """
        [{"ref":"سيرة ابن هشام 1/5","url":"https://example.org/a"},
         {"author":"النووي","book":"رياض الصالحين","locator":"باب 1"},
         {"author":"ابن حجر","book":"الفتح","ref":"1/10"},
         {"title":"مقالة","author":"فلان"},
         {"id":"x","name_ar":"قناة","platform":"يوتيوب","url":"https://e.org","post_url":"https://e.org/p"},
         {"ref":"x"}, "نص مباشر"]
        """.data(using: .utf8)!
        let r = SourceRef.list(json)
        XCTAssertEqual(r.map(\.display), ["سيرة ابن هشام 1/5", "النووي، رياض الصالحين، باب 1", "ابن حجر، الفتح، 1/10", "مقالة، فلان", "قناة، يوتيوب", "نص مباشر"])
        XCTAssertEqual(r[0].url?.absoluteString, "https://example.org/a")
        XCTAssertNil(r[1].url)
        XCTAssertEqual(r[4].url?.absoluteString, "https://e.org/p")
    }
}
