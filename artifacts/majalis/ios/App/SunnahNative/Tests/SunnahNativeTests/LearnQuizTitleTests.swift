import XCTest
@testable import SunnahNative

final class LearnQuizTitleTests: XCTestCase {
    private func title(_ file: String) -> String {
        LearnQuizManifest.Chunk(file: file, count: 1).title
    }

    func testNumericSuffixStripped() {
        XCTAssertEqual(title("السيرة_النبوية-012.json"), "السيرة النبوية")
    }

    func testImportFileNameNeverShownAsTitle() {
        let t = title("منقول_من_الأسئلة-edu.json")
        XCTAssertFalse(t.contains("منقول"))
        XCTAssertFalse(t.contains("edu"))
        XCTAssertFalse(t.isEmpty)
    }
}
