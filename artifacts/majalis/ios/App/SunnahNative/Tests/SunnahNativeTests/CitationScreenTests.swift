import XCTest
@testable import SunnahNative

final class CitationScreenTests: XCTestCase {
    func testPathEncodesSlug() {
        XCTAssertEqual(CitationPath.path(slug: "abc-123_x"), "/api/citations/abc-123_x")
        XCTAssertEqual(CitationPath.path(slug: "a/b c"), "/api/citations/a%2Fb%20c")
    }

    func testDecodesApiShape() throws {
        let json = #"{"ok":true,"citation":{"quoted_text":"نص","source":{"title_ar":"عنوان","book_name":"كتاب","volume":"2","page_number":"9","publish_year":1999}}}"#
        let p = try JSONDecoder().decode(CitationPayload.self, from: Data(json.utf8))
        XCTAssertEqual(p.citation?.quoted_text, "نص")
        XCTAssertEqual(CitationScreen.meta(p.citation?.source), "المصدر: كتاب، ج2، ص9\nالسنة: 1999")
    }

    func testNotFoundShapeAndErrors() throws {
        let p = try JSONDecoder().decode(CitationPayload.self, from: Data(#"{"ok":false,"error":"x"}"#.utf8))
        XCTAssertFalse(p.ok); XCTAssertNil(p.citation)
        XCTAssertTrue(CitationPath.isNotFound(DataStoreErrorProbe.notFound))
        XCTAssertFalse(CitationPath.isNotFound(DataStoreErrorProbe.timeout))
    }
}

private enum DataStoreErrorProbe: Error, Equatable { case notFound, timeout }
extension DataStoreErrorProbe: CustomStringConvertible {
    var description: String { self == .notFound ? "unavailable(status(404))" : "unavailable(timedOut)" }
}
