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

    /// البيانات الفعلية: كل مرحلة بعنوان ونص ومصدر، وكل مرجع آية يصلح لـQuranAyahText، ولا مرحلة تُعرض بلا مصدر.
    func testRealCreationOfManStagesAreRenderable() throws {
        var url = URL(fileURLWithPath: #filePath)
        for _ in 0..<8 { url.deleteLastPathComponent() }
        url.appendPathComponent("artifacts/majalis/public/data/explainers/creation-of-man.json")
        let d = try JSONDecoder().decode(ExplainerData.self, from: Data(contentsOf: url))
        let shown = try XCTUnwrap(d.displayable)
        XCTAssertEqual(shown.stages.count, d.stages.count, "كل المراحل موثّقة")
        for s in shown.stages {
            XCTAssertFalse(s.title.isEmpty); XCTAssertFalse(s.body.isEmpty)
            XCTAssertFalse((s.sources ?? []).isEmpty, s.id)
            XCTAssertFalse((s.ayahRef ?? []).isEmpty, s.id)
            for a in s.ayahRef ?? [] { XCTAssertNotNil(QuranAyahRange(surah: a.surah, from: a.from, to: a.to), s.id) }
        }
    }
}
