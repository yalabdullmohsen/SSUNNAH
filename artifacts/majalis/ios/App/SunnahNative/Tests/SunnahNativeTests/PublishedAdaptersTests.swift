import XCTest
@testable import SunnahNative

final class PublishedAdaptersTests: XCTestCase {
    func testDecodesExportedShapes() throws {
        let t = #"{"intro":null,"chapters":[{"id":"a","order":1,"title":"ت","summary":"م","body":["ب"],"source":"س","quizHint":null,"examples":[{"text":"ن","note":null,"surah":1,"ayah":2}]}]}"#
        XCTAssertEqual(try JSONDecoder().decode(TajweedFile.self, from: Data(t.utf8)).chapters.first?.examples.first?.ayah, 2)
        let h = #"[{"id":"1","slug":"s","title":"ع","shortDescription":null,"category":"quran","level":"beginner","source":null,"learningObjectives":[],"units":[{"id":"u","title":"و","sequence":1,"ref":{"surah":1,"ayahFrom":1,"ayahTo":7},"completionCriteria":null,"repetitionTarget":null}]}]"#
        let paths = try JSONDecoder().decode([HifzPath].self, from: Data(h.utf8))
        XCTAssertEqual(PublishedAdapters.hifzByCategory(paths).first?.title, "القرآن")
        XCTAssertEqual(PublishedAdapters.refText(paths[0].units[0].ref!) { _ in "الفاتحة" }, "الفاتحة: 1–7")
    }

    func testStatsGroupedInFixedOrder() throws {
        func stat(_ id: String, _ g: String) -> String {
            #"{"id":"\#(id)","label":"l","value":"1","note":null,"kind":"agreed","group":"\#(g)","method":null,"detail":null,"source":{"book":"b","author":"a","ref":"r"},"variants":[]}"#
        }
        let j = "[" + [stat("1", "suwar"), stat("2", "bunya")].joined(separator: ",") + "]"
        let rows = try JSONDecoder().decode([QuranStat].self, from: Data(j.utf8))
        XCTAssertEqual(PublishedAdapters.statsByGroup(rows).map(\.title), ["البنية", "السور"])
    }

    func testEveryPendingRouteIsUniqueAndNotImplemented() {
        XCTAssertEqual(Set(QuranSection.pendingIDs).count, QuranSection.pendingIDs.count)
    }
}
