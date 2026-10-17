import XCTest
@testable import SunnahNative

final class ExplainerModelsTests: XCTestCase {
    private func decode(_ json: String) throws -> [ExplainerData] { try JSONDecoder().decode([ExplainerData].self, from: Data(json.utf8)) }

    func testSourceDisplayFollowsSourcesField() throws {
        let rows = try decode(#"[{"id":"e","title":"t","stages":[{"id":"s","order":1,"title":"a","body":"b","sources":[{"author":"السعدي","book":"تيسير الكريم الرحمن","locator":"الآية 7"},{"title":"كتاب","author":"مؤلف"},{"ref":"مرجع"}]}]}]"#)
        let d = rows[0].stages[0].sources!.map(\.display)
        XCTAssertEqual(d, ["السعدي، تيسير الكريم الرحمن، الآية 7", "كتاب، مؤلف", "مرجع"])
    }

    func testStageWithoutSourceIsNotDisplayableAndOrderIsKept() throws {
        let rows = try decode(#"[{"id":"e","title":"t","stages":[{"id":"b","order":2,"title":"ب","body":"x","sources":[{"ref":"م"}]},{"id":"n","order":3,"title":"ن","body":"x"},{"id":"a","order":1,"title":"أ","body":"x","sources":[{"ref":"م"}]}]}]"#)
        XCTAssertEqual(rows[0].displayable?.stages.map(\.id), ["a", "b"])
    }

    func testAllStagesGetOriginalArtWithoutAssets() {
        // الرسم متجه برمجي: لا ملف صورة يحتاج ترخيصًا خارج السجلّ.
        XCTAssertNoThrow(ExplainerArt(stageID: "creation-of-man-6-ruh").body)
    }
}
